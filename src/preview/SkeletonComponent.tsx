import {
    ArrayProperty,
    EnumType,
    MapProperty,
    Properties,
    Property,
    StringProperty
} from "../models";
import React from "react";
import {
    Grid,
    List,
    ListItem,
    Table,
    TableBody,
    TableCell,
    TableRow
} from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";

export interface SkeletonComponentProps<T> {
    property: Property,
    small: boolean
}


export default function SkeletonComponent<T>({
                                                 property,
                                                 small
                                             }: SkeletonComponentProps<T>
) {

    if (!property) {
        console.error("No property assigned for skeleton component", property, small);
    }

    let content: JSX.Element | any;
    if (property.dataType === "string") {
        const stringProperty = property as StringProperty;
        if (stringProperty.config?.urlMediaType) {
            content = renderUrlComponent(stringProperty, small);
        } else if (stringProperty.config?.storageMeta) {
            content = renderImageThumbnail(small);
        } else {
            content = renderSkeletonText();
        }
    } else if (property.dataType === "array") {
        const arrayProperty = property as ArrayProperty;
        if (arrayProperty.of.dataType === "map")
            content = renderArrayOfMaps(arrayProperty.of.properties, small, arrayProperty.of.previewProperties);
        else if (arrayProperty.of.dataType === "string") {
            if (arrayProperty.of.config?.enumValues) {
                content = renderArrayEnumTableCell();
            } else if (arrayProperty.of.config?.storageMeta) {
                content = renderGenericArrayCell(arrayProperty.of);
            } else {
                content = renderArrayOfStrings();
            }
        } else {
            content = renderGenericArrayCell(arrayProperty.of);
        }
    } else if (property.dataType === "map") {
        content = renderMap(property as MapProperty, small);
    } else if (property.dataType === "timestamp") {
        content = renderSkeletonText();
    } else if (property.dataType === "reference") {
        content = renderReference();
    } else if (property.dataType === "boolean") {
        content = renderSkeletonText();
    } else {
        content = renderSkeletonText();
    }
    return (content ? content : null);
}

function renderMap<T>(property: MapProperty<T>, small: boolean) {
    let listProperties = property.previewProperties;
    if (!listProperties || !listProperties.length) {
        listProperties = Object.keys(property.properties);
        if (small)
            listProperties = listProperties.slice(0, 3);
    }

    return (
        <List>
            {listProperties && listProperties.map((key: string) => (
                <ListItem key={property.title + key}>
                    <SkeletonComponent
                        property={property.properties[key]}
                        small={true}/>
                </ListItem>
            ))}
        </List>
    );
}

function renderArrayOfMaps<P extends Properties>(properties: P, small:boolean, previewProperties?: (keyof P)[]) {
    let tableProperties = previewProperties;
    if (!tableProperties || !tableProperties.length) {
        tableProperties = Object.keys(properties);
        if (small)
            tableProperties = tableProperties.slice(0, 3);
    }

    return (
        <Table size="small">
            <TableBody>
                {
                    [0, 1, 2].map((value, index) => {
                        return (
                            <TableRow key={`table_${value}_${index}`}>
                                {tableProperties && tableProperties.map(
                                    (key, index) => (
                                        <TableCell
                                            key={`table-cell-${key}`}
                                            component="th"
                                        >
                                            <SkeletonComponent
                                                property={properties[key as string]}
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

function renderArrayOfStrings() {
    return (
        <Grid>
            {
                [0, 1].map((value, index) => (
                    <React.Fragment key={"skeleton_array_strings_" + value}>
                        {renderSkeletonText(index)}
                    </React.Fragment>
                ))}
        </Grid>
    );
}

function renderArrayEnumTableCell<T extends EnumType>() {
    return (
        <Grid>
            {
                [0, 1].map((value, index) =>
                    <React.Fragment key={"skeleton_array_enum_" + value}>
                        {renderSkeletonText(index)}
                    </React.Fragment>
                )}
        </Grid>
    );
}

function renderGenericArrayCell(
    property: Property
) {
    return (
        <Grid>

            {
                [0, 1].map((value, index) =>
                    <React.Fragment key={"skeleton_array_" + value}>
                        <SkeletonComponent property={property}
                                           small={true}/>
                    </React.Fragment>
                )}
        </Grid>
    );
}

function renderUrlAudioComponent() {
    return <Skeleton variant="rect"
                     width={300}
                     height={100}/>;
}

export function renderImageThumbnail(small: boolean) {
    return <Skeleton variant="rect"
                     width={small ? 100 : 200}
                     height={small ? 100 : 200}/>;
}

function renderUrlVideo(
    small: boolean) {

    return <Skeleton variant="rect"
                     width={small ? 300 : 500}
                     height={small ? 200 : 250}/>;
}

function renderReference() {
    return (
        <Skeleton variant="rect" width={200} height={100}/>
    );
}


function renderUrlComponent(property: StringProperty, small: boolean = false) {
    const mediaType = property.config?.urlMediaType || property.config?.storageMeta?.mediaType;
    if (mediaType === "image") {
        return renderImageThumbnail(small);
    } else if (mediaType === "audio") {
        return renderUrlAudioComponent();
    } else if (mediaType === "video") {
        return renderUrlVideo(small);
    }
    throw Error("URL component misconfiguration");
}


export function renderSkeletonText(index?: number) {
    return <Skeleton key={"skeleton_text_" + index} variant="text"/>;
}

export function renderSkeletonIcon() {
    return <Skeleton variant="rect" width={24} height={24}/>;
}

