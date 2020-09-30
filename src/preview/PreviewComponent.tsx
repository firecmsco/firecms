import {
    ArrayProperty,
    EntitySchema,
    EnumType,
    EnumValues,
    MapProperty,
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
    Divider,
    Grid,
    List,
    ListItem,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Typography
} from "@material-ui/core";
import StorageThumbnail from "./StorageThumbnail";
import DescriptionOutlinedIcon from "@material-ui/icons/DescriptionOutlined";
import ReferencePreview from "./ReferencePreview";
import { PreviewComponentProps } from "./PreviewComponentProps";
import { useStyles } from "../styles";
import CheckBox from "@material-ui/icons/CheckBox";
import CheckBoxOutlineBlank from "@material-ui/icons/CheckBoxOutlineBlank";
import ImagePreview from "./ImagePreview";
import { CustomChip } from "./CustomChip";

export default function PreviewComponent<T>({
                                                name,
                                                value,
                                                property,
                                                small
                                            }: PreviewComponentProps<T>
) {

    console.log("PreviewComponent", name, property);
    if (!property) {
        console.error("No property assigned for preview component", value, property, small);
    }

    let content: JSX.Element | any;

    if (property.config?.customPreview) {
        content = createElement(property.config.customPreview as React.ComponentType<PreviewComponentProps<T>>,
            {
                name,
                value,
                property,
                small
            });
    } else if (property.dataType === "string" && typeof value === "string") {
        const stringProperty = property as StringProperty;
        if (stringProperty.config?.urlMediaType) {
            content = renderUrlComponent(stringProperty, value, small);
        } else if (stringProperty.config?.storageMeta) {
            content = renderStorageThumbnail(stringProperty, value as string, small);
        } else if (stringProperty.config?.enumValues) {
            content = renderPreviewEnumChip(name, stringProperty.config.enumValues, value, small);
        } else {
            content = renderString(stringProperty, value, small);
        }
    } else if (property.dataType === "array" && value instanceof Array) {
        const arrayProperty = property as ArrayProperty;

        if ("dataType" in arrayProperty.of) {
            if (arrayProperty.of.dataType === "map") {
                content = renderArrayOfMaps(arrayProperty.of.properties, value, small, arrayProperty.of.previewProperties);
            } else if (arrayProperty.of.dataType === "string") {
                if (arrayProperty.of.config?.enumValues) {
                    content = renderArrayEnumTableCell(
                        name,
                        arrayProperty.of.config?.enumValues,
                        value,
                        false
                    );
                } else if (arrayProperty.of.config?.storageMeta) {
                    content = renderGenericArray(name, arrayProperty.of, value);
                } else {
                    content = renderArrayOfStrings(name, value,small);
                }
            } else {
                content = renderGenericArray(name, arrayProperty.of, value);
            }
        } else {
            content = renderShapedArray(name, arrayProperty.of, value);
        }
    } else if (property.dataType === "map" && typeof value === "object") {
        content = renderMap(property as MapProperty, value, small);
    } else if (property.dataType === "timestamp" && value instanceof Date) {
        content = value && renderTimestamp(value);
    } else if (property.dataType === "reference" && value instanceof firestore.DocumentReference) {
        const referenceProperty = property as ReferenceProperty;
        content = value && renderReference(value, referenceProperty.schema, small, referenceProperty.previewProperties);
    } else if (property.dataType === "boolean") {
        content = renderBoolean(!!value);
    } else {
        content = value;
    }
    return (content ? content : null);
};

function renderMap<T>(property: MapProperty<T>, value: T, small: boolean) {

    if (!value) return null;

    const classes = useStyles();

    let mapProperties: string[];
    if (!small) {
        mapProperties = Object.keys(property.properties);
    } else {
        if (property.previewProperties)
            mapProperties = property.previewProperties;
        else
            mapProperties = Object.keys(property.properties).slice(0, 3);
    }

    if (small)
        return (
            <List>
                {mapProperties.map((key: string) => (
                    <ListItem key={property.title + key}>
                        <PreviewComponent name={key}
                                          value={value[key] as any}
                                          property={property.properties[key]}
                                          small={small}/>
                    </ListItem>
                ))}
            </List>
        );

    return (
        <Table size="small">
            <TableBody>
                {mapProperties &&
                mapProperties.map((key, index) => {
                    return (
                        <TableRow key={`table_${property.title}_${index}`}
                                  className={classes.tableNoBottomBorder}>
                            <TableCell key={`table-cell-title-${key}`}
                                       component="th">
                                <Typography variant={"caption"}
                                            color={"textSecondary"}>
                                    {property.properties[key].title}
                                </Typography>
                            </TableCell>
                            <TableCell key={`table-cell-${key}`} component="th">
                                <PreviewComponent
                                    name={key}
                                    value={value[key] as any}
                                    property={property.properties[key]}
                                    small={true}/>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );

}

function renderArrayOfMaps(properties: Properties, values: any[], small: boolean, previewProperties?: string[]) {

    if (!values) return null;

    const classes = useStyles();

    let mapProperties = previewProperties;
    if (!mapProperties || !mapProperties.length) {
        mapProperties = Object.keys(properties);
        if (small)
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
                                        <PreviewComponent
                                            name={key}
                                            value={value[key] as any}
                                            property={properties[key]}
                                            small={true}/>
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

function renderArrayOfStrings(name: string, values: string[], small:boolean) {

    if (!values) return null;

    if (values && !Array.isArray(values)) {
        return <div>{`Unexpected value: ${values}`}</div>;
    }

    return (
        <Grid>
            {values &&
            values.map((value, index) => (
                <CustomChip
                    value={name}
                    label={value}
                    small={small}
                />
            ))}
        </Grid>
    );
}

function renderArrayEnumTableCell<T extends EnumType>(
    name: string,
    enumValues: EnumValues<T>,
    values: T[],
    small:boolean
) {

    if (!values) return null;

    return (
        <Grid>
            {values &&
            values.map((value, index) =>
                renderPreviewEnumChip(name, enumValues, value, small)
            )}
        </Grid>
    );
}

function renderGenericArray<T extends EnumType>(
    name: string,
    property: Property,
    values: T[]
) {

    if (!values) return null;

    return (
        <Grid>

            {values &&
            values.map((value, index) =>
                <React.Fragment key={"preview_array_" + value + "_" + index}>
                    <Box m={1}>
                        <PreviewComponent name={name}
                                          value={value}
                                          property={property}
                                          small={true}/>
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
    values: T[]
) {

    if (!values) return null;

    return (
        <Grid>
            {values &&
            properties.map((property, index) =>
                <React.Fragment
                    key={"preview_array_" + values[index] + "_" + index}>
                    {values[index] && <Box m={1}>
                        <PreviewComponent name={name}
                                          property={property}
                                          value={values[index]}
                                          small={true}/>
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
                                 small: boolean) {
    return (
        <ImagePreview url={url} small={small}/>
    );
}

function renderUrlVideo(url: string,
                        small: boolean) {
    return (
        <CardMedia
            style={{ maxWidth: small ? 300 : 500 }}
            component="video"
            controls
            image={url}
        />
    );
}

function renderUrlFile(url: string, small: boolean) {
    return (
        <a href={url}
           target="_blank"
           onClick={(e) => e.stopPropagation()}>
            <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                width={small ? 100 : 200}
                height={small ? 100 : 200}>
                <DescriptionOutlinedIcon/>
            </Box>
        </a>
    );
}

function renderReference<S extends EntitySchema>(
    ref: firestore.DocumentReference,
    refSchema: S,
    small: boolean,
    previewProperties?: (keyof S["properties"])[]
) {

    if (!ref) return null;

    return (
        <ReferencePreview
            reference={ref}
            schema={refSchema}
            previewComponent={PreviewComponent}
            previewProperties={previewProperties}
            small={small}
        />
    );
}

export function renderUrlComponent(property: StringProperty,
                                   url: any,
                                   small: boolean = false) {

    if (!url) return <div/>;

    const mediaType = property.config?.urlMediaType || property.config?.storageMeta?.mediaType;
    if (mediaType === "image") {
        return renderUrlImageThumbnail(url, small);
    } else if (mediaType === "audio") {
        return renderUrlAudioComponent(url);
    } else if (mediaType === "video") {
        return renderUrlVideo(url, small);
    } else {
        return renderUrlFile(url, small);
    }
}

export function renderString(property: StringProperty,
                             value: any,
                             small: boolean = false) {

    if (property.config?.enumValues) {
        return property.config?.enumValues[value];
    } else if (property.config?.multiline) {
        return (
            <Box minWidth={300}
                 style={{ lineClamp: 5, textOverflow: "ellipsis" }}>
                {value}
            </Box>
        );
    } else {
        return <Box minWidth={120}>
            {value}
        </Box>;
    }

}

export function renderStorageThumbnail(
    property: StringProperty,
    storagePath: string | undefined,
    small: boolean
) {
    if (!storagePath) return null;

    return (
        <StorageThumbnail
            storagePathOrDownloadUrl={storagePath}
            property={property}
            small={small}
            renderUrlComponent={renderUrlComponent}
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
    small: boolean
) {
    if (!value) return null;

    const label = enumValues[value];
    const key: string = typeof value == "number" ? `${name}_${value}` : value as string;

    return <CustomChip value={key}
                       label={label || value}
                       error={!label}
                       outlined={false}
                       small={small}/>;

}

