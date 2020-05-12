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
import React from "react";
import * as firebase from "firebase";
import {
    CardMedia,
    Chip,
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
import ReferencePreview from "./ReferencePreview";
import { PreviewComponentProps } from "./PreviewComponentProps";

export default function PreviewComponent<T>({
                                                value,
                                                property,
                                                small
                                            }: PreviewComponentProps<T>
) {

    console.debug("renderPreviewComponent", value, property, small);

    if (!value) return null;

    if (!property) {
        console.error("No property assigned for preview component", value, property, small);
    }

    let content: JSX.Element | any;
    if (property.dataType === "string" && typeof value === "string") {
        const stringProperty = property as StringProperty;
        if (stringProperty.urlMediaType) {
            content = renderUrlComponent(stringProperty, value, small);
        } else if (stringProperty.storageMeta) {
            content = renderStorageThumbnail(stringProperty, value as string, small);
        } else if (stringProperty.enumValues) {
            content = stringProperty.enumValues[value];
        } else {
            content = value;
        }
    } else if (property.dataType === "array" && value instanceof Array) {
        const arrayProperty = property as ArrayProperty<any>;
        if (arrayProperty.of.dataType === "map")
            content = renderArrayOfMaps(arrayProperty.of.properties, value);
        else if (arrayProperty.of.dataType === "string") {
            if (arrayProperty.of.enumValues) {
                content = renderArrayEnumTableCell(
                    arrayProperty.of.enumValues,
                    value
                );
            } else if (arrayProperty.of.storageMeta) {
                content = renderGenericArrayCell(arrayProperty.of, value);
            } else {
                content = renderArrayOfStrings(value);
            }
        } else {
            content = renderGenericArrayCell(arrayProperty.of, value);
        }
    } else if (property.dataType === "map" && typeof value === "object") {
        content = renderMap(property as MapProperty<any>, value);
    } else if (property.dataType === "timestamp" && value instanceof Date) {
        content = value && value.toLocaleString();
    } else if (property.dataType === "reference" && value instanceof firebase.firestore.DocumentReference) {
        content = value && renderReference(value, (property as ReferenceProperty<any>).schema);
    } else if (property.dataType === "boolean") {
        content = value ? "Yes" : "No";
    } else {
        content = typeof value === "object" ? (value as unknown as object).toString() : (value ? value : null);
    }
    return content;
}

function renderMap<T>(property: MapProperty<T>, value: T) {
    let listProperties = Object.entries(property.properties).filter(
        ([_, property]) => property.includeAsMapPreview
    );
    if (!listProperties.length) {
        listProperties = Object.entries(property.properties).slice(0, 3);
    }

    return (
        <List>
            {listProperties.map(([key, property]) => (
                <ListItem key={property.title + key}>
                    <PreviewComponent value={value[key] as any}
                                      property={property}
                                      small={true}/>
                </ListItem>
            ))}
        </List>
    );
}

function renderArrayOfMaps(properties: Properties, values: any[]) {
    let tableProperties = Object.entries(properties).filter(
        ([_, property]) => property.includeAsMapPreview
    );
    if (!tableProperties.length) {
        tableProperties = Object.entries(properties).slice(0, 3);
    }

    return (
        <Table size="small">
            <TableBody>
                {values &&
                values.map((value, index) => {
                    return (
                        <TableRow key={`table_${value}_${index}`}>
                            {tableProperties.map(
                                ([key, property], index) => (
                                    <TableCell
                                        key={`table-cell-${key}`}
                                        component="th"
                                    >
                                        <PreviewComponent
                                            value={value[key] as any}
                                            property={property}
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

function renderArrayOfStrings(values: string[]) {
    if (values && !Array.isArray(values)) {
        return <div>{`Unexpected value: ${values}`}</div>;
    }
    return (
        <Grid>
            {values &&
            values.map((value, index) => (
                <Chip
                    size="small"
                    key={value}
                    label={
                        <Typography variant="caption" color="textPrimary">
                            {value}
                        </Typography>
                    }
                />
            ))}
        </Grid>
    );
}

function renderArrayEnumTableCell<T extends EnumType>(
    enumValues: EnumValues<T>,
    values: T[]
) {
    return (
        <Grid>
            {values &&
            values.map((value, index) =>
                renderPreviewEnumChip(enumValues, value)
            )}
        </Grid>
    );
}

function renderGenericArrayCell<T extends EnumType>(
    property: Property,
    values: T[]
) {
    return (
        <Grid>

            {values &&
            values.map((value, index) =>
                <React.Fragment>
                    <PreviewComponent value={value}
                                      property={property}
                                      small={true}/>
                    {index < values.length - 1 && <Divider/>}
                </React.Fragment>
            )}
        </Grid>
    );
}

function renderUrlAudioComponent(value: any) {
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
        <img src={url}
             style={{
                 maxWidth: small ? 100 : 200,
                 maxHeight: small ? 100 : 200
             }}/>
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

function renderReference(
    ref: firebase.firestore.DocumentReference,
    refSchema: EntitySchema
) {
    return (
        <ReferencePreview
            reference={ref}
            schema={refSchema}
            previewComponent={PreviewComponent}
        />
    );
}

export function renderUrlComponent(property: StringProperty, url: any,
                                   small: boolean = false) {
    const mediaType = property.urlMediaType || property.storageMeta?.mediaType;
    if (mediaType === "image") {
        return renderUrlImageThumbnail(url, small);
    } else if (mediaType === "audio") {
        return renderUrlAudioComponent(url);
    } else if (mediaType === "video") {
        return renderUrlVideo(url, small);
    }
    throw Error("URL component misconfigured");
}

export function renderStorageThumbnail(
    property: StringProperty,
    storagePath: string | undefined,
    small: boolean
) {
    return (
        <StorageThumbnail
            storagePath={storagePath}
            property={property}
            small={small}
            renderUrlComponent={renderUrlComponent}
        />
    );
}

export function renderPreviewEnumChip<T extends EnumType>(
    enumValues: EnumValues<T>,
    value: any
) {
    const label = enumValues[value as T];
    return (
        <Chip
            size="small"
            key={value}
            label={
                <Typography
                    variant="caption"
                    color={label ? "textPrimary" : "error"}
                >
                    {label || value}
                </Typography>
            }
        />
    );
}

