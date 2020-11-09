import {
    ArrayProperty,
    EntitySchema,
    EnumType,
    EnumValues,
    MapProperty,
    MediaType,
    Properties,
    Property,
    ReferenceProperty,
    StringProperty
} from "../models";
import React, { createElement } from "react";
import { firestore } from "firebase/app";

import {
    Box,
    CardMedia,
    createStyles,
    Divider,
    Grid,
    Link,
    ListItem,
    makeStyles,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Theme,
    Typography
} from "@material-ui/core";
import StorageThumbnail from "./StorageThumbnail";
import DescriptionOutlinedIcon from "@material-ui/icons/DescriptionOutlined";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import ReferencePreview from "./ReferencePreview";
import {
    getThumbnailMeasure,
    PreviewComponentProps,
    PreviewSize
} from "./PreviewComponentProps";
import CheckBox from "@material-ui/icons/CheckBox";
import CheckBoxOutlineBlank from "@material-ui/icons/CheckBoxOutlineBlank";
import ImagePreview from "./ImagePreview";
import { CustomChip } from "./CustomChip";

import ErrorBoundary from "../components/ErrorBoundary";
import { EmptyValue } from "../components/EmptyValue";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        tableNoBottomBorder: {
            "&:last-child th, &:last-child td": {
                borderBottom: 0
            }
        }
    })
);

function PreviewComponent<T>({
                                 name,
                                 value,
                                 property,
                                 size,
                                 entitySchema
                             }: PreviewComponentProps<T>) {

    if (!property) {
        console.error("No property assigned for preview component", value, property, size);
    }

    let content: JSX.Element | any;

    if (property.config?.customPreview) {
        content = createElement(property.config.customPreview as React.ComponentType<PreviewComponentProps>,
            {
                name,
                value,
                property,
                size,
                entitySchema
            });
    } else if (property.dataType === "string" && typeof value === "string") {
        const stringProperty = property as StringProperty;
        if (stringProperty.config?.url) {
            content = renderUrlComponent(stringProperty, value, size, entitySchema);
        } else if (stringProperty.config?.storageMeta) {
            content = renderStorageThumbnail(stringProperty, value as string, size, entitySchema);
        } else if (stringProperty.config?.enumValues) {
            content = renderPreviewEnumChip(name, stringProperty.config.enumValues, value, size);
        } else {
            content = renderString(name, stringProperty, value, size, entitySchema);
        }
    } else if (property.dataType === "array" && value instanceof Array) {
        const arrayProperty = property as ArrayProperty;

        if ("dataType" in arrayProperty.of) {
            if (arrayProperty.of.dataType === "map") {
                content = renderArrayOfMaps(arrayProperty.of.properties, value, size, entitySchema, arrayProperty.of.previewProperties);
            } else if (arrayProperty.of.dataType === "reference") {
                content = renderArrayOfReferences(name, arrayProperty.of, value, size, entitySchema);
            } else if (arrayProperty.of.dataType === "string") {
                if (arrayProperty.of.config?.enumValues) {
                    content = renderArrayEnumTableCell(
                        name,
                        arrayProperty.of.config?.enumValues,
                        value,
                        size
                    );
                } else if (arrayProperty.of.config?.storageMeta) {
                    content = renderArrayOfStorageComponents(name, arrayProperty.of, value, size, entitySchema);
                } else {
                    content = renderArrayOfStrings(name, arrayProperty.of, value, size, entitySchema);
                }
            } else {
                content = renderGenericArray(name, arrayProperty.of, value, size, entitySchema);
            }
        } else {
            content = renderShapedArray(name, arrayProperty.of, value, entitySchema);
        }
    } else if (property.dataType === "map" && typeof value === "object") {
        content = renderMap(property as MapProperty, value, size, entitySchema);
    } else if (property.dataType === "timestamp" && value instanceof Date) {
        content = value && renderTimestamp(value);
    } else if (property.dataType === "reference" && value instanceof firestore.DocumentReference) {
        const referenceProperty = property as ReferenceProperty;
        content = value && renderReference(value, referenceProperty.schema, size, entitySchema, referenceProperty.previewProperties);
    } else if (property.dataType === "boolean") {
        content = renderBoolean(!!value);
    } else if (property.dataType === "number") {
        content = value;
    } else {
        content = value;
    }
    return content === undefined || content === null ? <EmptyValue/> : content;
}

export default React.memo<PreviewComponentProps>(PreviewComponent);


function renderMap<T>(property: MapProperty<T>,
                      value: T,
                      size: PreviewSize,
                      entitySchema: EntitySchema) {

    if (!value) return null;

    const classes = useStyles();

    let mapProperties: string[];
    if (size === "regular") {
        mapProperties = Object.keys(property.properties);
    } else {
        mapProperties = property.previewProperties || Object.keys(property.properties);
        if (size === "small")
            mapProperties = mapProperties.slice(0, 3);
        else if (size === "tiny")
            mapProperties = mapProperties.slice(0, 1);
    }

    if (size !== "regular")
        return (
            <React.Fragment>
                {mapProperties.map((key, index) => (
                    <ListItem key={"map_preview_" + property.title + key + index}>
                        <ErrorBoundary>
                            <PreviewComponent name={key}
                                              value={value[key] as any}
                                              property={property.properties[key]}
                                              size={size}
                                              entitySchema={entitySchema}/>
                        </ErrorBoundary>
                    </ListItem>
                ))}
            </React.Fragment>
        );

    return (
        <Table size="small">
            <TableBody>
                {mapProperties &&
                mapProperties.map((key, index) => {
                    return (
                        <TableRow
                            key={`map_preview_table_${property.title}_${index}`}
                            className={classes.tableNoBottomBorder}>
                            <TableCell key={`table-cell-title-${key}`}
                                       component="th">
                                <Typography variant={"caption"}
                                            color={"textSecondary"}>
                                    {property.properties[key].title}
                                </Typography>
                            </TableCell>
                            <TableCell key={`table-cell-${key}`} component="th">
                                <ErrorBoundary>
                                    <PreviewComponent
                                        name={key}
                                        value={value[key] as any}
                                        property={property.properties[key]}
                                        size={"small"}
                                        entitySchema={entitySchema}/>
                                </ErrorBoundary>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );

}

function renderArrayOfMaps(properties: Properties,
                           values: any[],
                           size: PreviewSize,
                           entitySchema: EntitySchema,
                           previewProperties?: string[]) {

    if (!values) return null;

    const classes = useStyles();

    let mapProperties = previewProperties;
    if (!mapProperties || !mapProperties.length) {
        mapProperties = Object.keys(properties);
        if (size)
            mapProperties = mapProperties.slice(0, 3);
    }

    return (
        <Table size="small">
            <TableBody>
                {values &&
                values.map((value, index) => {
                    return (
                        <TableRow key={`table_${value}_${index}`}
                                  className={classes.tableNoBottomBorder}>
                            {mapProperties && mapProperties.map(
                                (key, index) => (
                                    <TableCell
                                        key={`table-cell-${key}`}
                                        component="th"
                                    >
                                        <ErrorBoundary>
                                            <PreviewComponent
                                                name={key}
                                                value={value[key] as any}
                                                property={properties[key]}
                                                size={"small"}
                                                entitySchema={entitySchema}/>
                                        </ErrorBoundary>
                                    </TableCell>
                                )
                            )}
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}

function renderArrayOfStrings(name: string,
                              property: StringProperty,
                              values: string[],
                              size: PreviewSize,
                              entitySchema: EntitySchema) {

    if (!values) return null;

    if (values && !Array.isArray(values)) {
        return <div>{`Unexpected value: ${values}`}</div>;
    }

    return (
        <Box display={property.config?.previewAsTag ? "flex" : "block"}
             flexWrap={"wrap"}>
            {values &&
            values.map((value, index) =>
                <Box m={property.config?.previewAsTag ? 0.2 : 0.5}
                     key={`preview_array_strings_${name}_${index}`}>
                    <ErrorBoundary>
                        {renderString(name, property, value, size, entitySchema)}
                    </ErrorBoundary>
                </Box>
            )}
        </Box>
    );
}

function renderArrayOfReferences(name: string,
                                 property: ReferenceProperty,
                                 values: firestore.DocumentReference[],
                                 size: PreviewSize,
                                 entitySchema: EntitySchema) {


    const childSize: PreviewSize = size === "regular" ? "small" : "tiny";

    return (
        <Box>
            {values &&
            values.map((value, index) =>
                    <Box m={0.2} key={`preview_array_ref_${name}_${index}`}>
                        {renderReference(value, property.schema, childSize, entitySchema, property.previewProperties)}
                    </Box>
            )}
        </Box>
    );
}

function renderArrayEnumTableCell<T extends EnumType>(
    name: string,
    enumValues: EnumValues<T>,
    values: T[],
    size: PreviewSize
) {

    if (!values) return null;

    return (
        <Box display={"flex"} flexWrap="wrap">
            {values &&
            values.map((value, index) => <Box m={0.2}>
                    <ErrorBoundary key={`preview_array_ref_${name}_${index}`}>
                        {
                            renderPreviewEnumChip(name, enumValues, value, size)
                        }
                    </ErrorBoundary>
                </Box>
            )}
        </Box>
    );
}

function renderGenericArray<T extends EnumType>(
    name: string,
    property: Property,
    values: T[],
    size: PreviewSize,
    entitySchema: EntitySchema
) {

    if (!values) return null;

    const childSize: PreviewSize = size === "regular" ? "small" : "tiny";

    return (
        <Grid>
            {values &&
            values.map((value, index) =>
                <React.Fragment key={"preview_array_" + value + "_" + index}>
                    <Box p={1}>
                        <ErrorBoundary>
                            <PreviewComponent name={name}
                                              value={value}
                                              property={property}
                                              size={childSize}
                                              entitySchema={entitySchema}/>
                        </ErrorBoundary>
                    </Box>
                    {index < values.length - 1 && <Divider/>}
                </React.Fragment>
            )}
        </Grid>
    );
}

function renderShapedArray<T extends EnumType>(
    name: string,
    properties: Property[],
    values: T[],
    entitySchema: EntitySchema
) {

    if (!values) return null;

    return (
        <Grid>
            {values &&
            properties.map((property, index) =>
                <React.Fragment
                    key={"preview_array_" + values[index] + "_" + index}>
                    {values[index] && <Box p={1}>
                        <ErrorBoundary>
                            <PreviewComponent name={name}
                                              property={property}
                                              value={values[index]}
                                              size={"small"}
                                              entitySchema={entitySchema}/>
                        </ErrorBoundary>
                    </Box>}
                    {values[index] && index < values.length - 1 && <Divider/>}
                </React.Fragment>
            )}
        </Grid>
    );
}

function renderUrlAudioComponent(value: string) {

    return (
        <audio controls src={value}>
            Your browser does not support the
            <code>audio</code> element.
        </audio>
    );
}

function renderUrlImageThumbnail(url: string,
                                 size: PreviewSize) {
    return (
        <ImagePreview key={`image_preview_${url}_${size}`} url={url}
                      size={size}/>
    );
}

function renderUrlVideo(url: string,
                        size: PreviewSize) {
    return (
        <CardMedia
            style={{ maxWidth: size === "small" ? 300 : 500 }}
            component="video"
            controls
            image={url}
        />
    );
}


function renderUrlFile(url: string, size: PreviewSize) {
    return (
        <a
            href={url}
            rel="noopener noreferrer"
            target="_blank"
            onClick={(e) => e.stopPropagation()}>
            <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                width={getThumbnailMeasure(size)}
                height={getThumbnailMeasure(size)}>
                <DescriptionOutlinedIcon/>
            </Box>
        </a>
    );
}

function renderReference(
    ref: firestore.DocumentReference,
    refSchema: EntitySchema | "self",
    size: PreviewSize,
    entitySchema: EntitySchema,
    previewProperties?: string[]
) {

    if (!ref) return null;

    return (
        <ReferencePreview
            reference={ref}
            schema={refSchema === "self" ? entitySchema : refSchema}
            previewComponent={PreviewComponent}
            previewProperties={previewProperties}
            entitySchema={entitySchema}
            size={size}
        />
    );
}

export function renderUrlComponent(property: StringProperty,
                                   url: string,
                                   size: PreviewSize,
                                   entitySchema: EntitySchema) {

    if (!url) return <div/>;
    if (typeof property.config?.url === "boolean" && property.config.url) {
        return <Link style={{
            display: "flex",
            wordBreak: "break-word",
            fontWeight: 500
        }}
                     href={url}
                     onClick={(e: React.MouseEvent) => e.stopPropagation()}
                     target="_blank">
            <OpenInNewIcon style={{ marginRight: 8 }} fontSize={"small"}/>
            {url}
        </Link>;
    }

    const mediaType: MediaType = property.config?.url as MediaType
        || property.config?.storageMeta?.mediaType;
    if (mediaType === "image") {
        return renderUrlImageThumbnail(url, size);
    } else if (mediaType === "audio") {
        return renderUrlAudioComponent(url);
    } else if (mediaType === "video") {
        return renderUrlVideo(url, size);
    } else {
        return renderUrlFile(url, size);
    }
}

export function renderArrayOfStorageComponents(name: string,
                                               property: StringProperty,
                                               values: any[],
                                               size: PreviewSize,
                                               entitySchema: EntitySchema) {


    const childSize: PreviewSize = size === "regular" ? "small" : "tiny";

    return <Box
        display={"flex"}
        flexWrap="wrap">
        {values &&
        values.map((value, index) =>
            <Box m={0.2}
                 key={"preview_array_storage_" + name + value + index}>
                <ErrorBoundary>
                    <PreviewComponent name={name}
                                      value={value}
                                      property={property}
                                      size={childSize}
                                      entitySchema={entitySchema}/>
                </ErrorBoundary>
            </Box>
        )}
    </Box>;
}

export function renderString(name: string,
                             property: StringProperty,
                             value: any,
                             size: PreviewSize,
                             entitySchema: EntitySchema) {

    if (property.config?.enumValues) {
        return property.config?.enumValues[value];
    } else if (property.config?.previewAsTag) {
        return <ErrorBoundary>
            <CustomChip
                name={name}
                label={value}
                small={size !== "regular"}
            />
        </ErrorBoundary>;
    } else {
        return (value);
    }

}

export function renderStorageThumbnail(
    property: StringProperty,
    storagePath: string | undefined,
    size: PreviewSize,
    entitySchema: EntitySchema
) {
    if (!storagePath) return null;

    return (
        <StorageThumbnail
            storagePathOrDownloadUrl={storagePath}
            property={property}
            size={size}
            renderUrlComponent={renderUrlComponent}
            entitySchema={entitySchema}
        />
    );
}

export function renderTimestamp(value: Date) {
    return (
        <Typography variant={"body2"}>
            {value.toLocaleString()}
        </Typography>
    );
}

export function renderBoolean(
    value: boolean | undefined
) {
    return value ? <CheckBox color="secondary"/> :
        <CheckBoxOutlineBlank color="disabled"/>;
}

export function renderPreviewEnumChip<T extends EnumType>(
    name: string,
    enumValues: EnumValues<T>,
    value: T,
    size: PreviewSize
) {
    if (!value) return null;

    const label = enumValues[value];
    const key: string = typeof value == "number" ? `${name}_${value}` : value as string;

    return <CustomChip name={key}
                       label={label || value}
                       error={!label}
                       outlined={false}
                       small={size !== "regular"}/>;

}


