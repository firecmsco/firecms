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
    property: Property<T>,
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
        if (stringProperty.urlMediaType) {
            content = renderUrlComponent(stringProperty, small);
        } else if (stringProperty.storageMeta) {
            content = renderImageThumbnail(small);
        } else {
            content = renderSkeletonText();
        }
    } else if (property.dataType === "array") {
        const arrayProperty = property as ArrayProperty<any>;
        if (arrayProperty.of.dataType === "map")
            content = renderArrayOfMaps(arrayProperty.of.properties);
        else if (arrayProperty.of.dataType === "string") {
            if (arrayProperty.of.enumValues) {
                content = renderArrayEnumTableCell();
            } else if (arrayProperty.of.storageMeta) {
                content = renderGenericArrayCell(arrayProperty.of);
            } else {
                content = renderArrayOfStrings();
            }
        } else {
            content = renderGenericArrayCell(arrayProperty.of);
        }
    } else if (property.dataType === "map") {
        content = renderMap(property as MapProperty<any>);
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

function renderMap<T>(property: MapProperty<T>) {
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
                    <SkeletonComponent
                        property={property}
                        small={true}/>
                </ListItem>
            ))}
        </List>
    );
}

function renderArrayOfMaps(properties: Properties) {
    let tableProperties = Object.entries(properties).filter(
        ([_, property]) => property.includeAsMapPreview
    );
    if (!tableProperties.length) {
        tableProperties = Object.entries(properties).slice(0, 3);
    }

    return (
        <Table size="small">
            <TableBody>
                {
                    [0, 1, 2].map((value, index) => {
                        return (
                            <TableRow key={`table_${value}_${index}`}>
                                {tableProperties.map(
                                    ([key, property], index) => (
                                        <TableCell
                                            key={`table-cell-${key}`}
                                            component="th"
                                        >
                                            <SkeletonComponent
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

function renderArrayOfStrings() {
    return (
        <Grid>
            {
                [0, 1].map((value, index) => (
                    renderSkeletonText()
                ))}
        </Grid>
    );
}

function renderArrayEnumTableCell<T extends EnumType>() {
    return (
        <Grid>
            {
                [0, 1].map((value, index) =>
                    renderSkeletonText()
                )}
        </Grid>
    );
}

function renderGenericArrayCell<T extends EnumType>(
    property: Property
) {
    return (
        <Grid>

            {
                [0, 1].map((value, index) =>
                    <React.Fragment>
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
    const mediaType = property.urlMediaType || property.storageMeta?.mediaType;
    if (mediaType === "image") {
        return renderImageThumbnail(small);
    } else if (mediaType === "audio") {
        return renderUrlAudioComponent();
    } else if (mediaType === "video") {
        return renderUrlVideo(small);
    }
    throw Error("URL component misconfigured");
}


export function renderSkeletonText() {
    return <Skeleton variant="text"/>;
}

export function renderSkeletonIcon() {
    return <Skeleton variant="rect" width={24} height={24}/>;
}

