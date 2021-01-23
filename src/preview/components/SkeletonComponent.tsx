import {
    ArrayProperty,
    EnumType,
    MapProperty,
    Properties,
    Property,
    StringProperty
} from "../../models";
import React from "react";
import {
    Divider,
    Grid,
    List,
    ListItem,
    Table,
    TableBody,
    TableCell,
    TableRow
} from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import { PreviewSize } from "../../models/preview_component_props";
import { useStyles } from "./styles";
import { getThumbnailMeasure } from "../util";

export interface SkeletonComponentProps<T> {
    property: Property,
    size: PreviewSize
}

export default function SkeletonComponent<T>({
                                                 property,
                                                 size
                                             }: SkeletonComponentProps<T>
) {

    if (!property) {
        console.error("No property assigned for skeleton component", property, size);
    }

    let content: JSX.Element | any;
    if (property.dataType === "string") {
        const stringProperty = property as StringProperty;
        if (stringProperty.config?.url) {
            content = renderUrlComponent(stringProperty, size);
        } else if (stringProperty.config?.storageMeta) {
            content = renderSkeletonImageThumbnail(size);
        } else {
            content = renderSkeletonText();
        }
    } else if (property.dataType === "array") {
        const arrayProperty = property as ArrayProperty;

        if ("dataType" in arrayProperty.of) {
            if (arrayProperty.of.dataType === "map")
                content = renderArrayOfMaps(arrayProperty.of.properties, size, arrayProperty.of.previewProperties);
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
        } else {
            content = renderShapedArray(arrayProperty.of);
        }

    } else if (property.dataType === "map") {
        content = renderMap(property as MapProperty, size);
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

function renderMap<T>(property: MapProperty<T>, size: PreviewSize) {

    const classes = useStyles();

    let mapProperties: string[];
    if (!size) {
        mapProperties = Object.keys(property.properties);
    } else {
        if (property.previewProperties)
            mapProperties = property.previewProperties;
        else
            mapProperties = Object.keys(property.properties).slice(0, 3);
    }

    if (size)
        return (
            <List>
                {mapProperties && mapProperties.map((key: string) => (
                    <ListItem key={property.title + key}>
                        <SkeletonComponent
                            property={property.properties[key]}
                            size={"small"}/>
                    </ListItem>
                ))}
            </List>
        );

    return (
        <Table size={"small"}>
            <TableBody>
                {mapProperties &&
                mapProperties.map((key, index) => {
                    return (
                        <TableRow key={`table_${property.title}_${index}`}
                                  className={classes.tableNoBottomBorder}>
                            <TableCell key={`table-cell-title-${key}`}
                                       component="th">
                                <Skeleton variant="text"/>
                            </TableCell>
                            <TableCell key={`table-cell-${key}`} component="th">
                                <SkeletonComponent
                                    property={property.properties[key]}
                                    size={"small"}/>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );

}

function renderArrayOfMaps<P extends Properties>(properties: P, size: PreviewSize, previewProperties?: (keyof P)[]) {
    let tableProperties = previewProperties;
    if (!tableProperties || !tableProperties.length) {
        tableProperties = Object.keys(properties);
        if (size)
            tableProperties = tableProperties.slice(0, 3);
    }

    return (
        <Table size={"small"}>
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
                                                size={"small"}/>
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
                    <>
                        {renderSkeletonText(index)}
                    </>
                ))}
        </Grid>
    );
}

function renderArrayEnumTableCell<T extends EnumType>() {
    return (
        <Grid>
            {
                [0, 1].map((value, index) =>
                    <>
                        {renderSkeletonText(index)}
                    </>
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
                    <>
                        <SkeletonComponent property={property}
                                           size={"small"}/>
                    </>
                )}
        </Grid>
    );
}

function renderShapedArray<T extends EnumType>(
    properties: Property[]
) {

    const classes = useStyles();

    return (
        <Grid>
            {properties &&
            properties.map((property, index) =>
                <React.Fragment
                    key={"preview_array_" + properties[index] + "_" + index}>
                    {properties[index] && (
                        <div className={classes.smallMargin}>
                            <SkeletonComponent
                                property={property}
                                size={"small"}/>
                        </div>
                    )}
                    {properties[index] && index < properties.length - 1 &&
                    <Divider/>}
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

export function renderSkeletonImageThumbnail(size: PreviewSize) {
    const imageSize = size === "tiny" ? 40 : size === "small" ? 100 : 200;
    return <Skeleton variant="rect"
                     width={imageSize}
                     height={imageSize}/>;
}

function renderUrlVideo(size: PreviewSize) {

    return <Skeleton variant="rect"
                     width={size !== "regular" ? 300 : 500}
                     height={size !== "regular" ? 200 : 250}/>;
}

function renderReference() {
    return (
        <Skeleton variant="rect" width={200} height={100}/>
    );
}


function renderUrlComponent(property: StringProperty, size: PreviewSize = "regular") {

    if (typeof property.config?.url === "boolean" && property.config.url) {
        return <div style={{
            display: "flex"
        }}>
            {renderSkeletonIcon()}
            {renderSkeletonText()}
        </div>;
    }

    const mediaType = property.config?.url || property.config?.storageMeta?.mediaType;
    if (mediaType === "image") {
        return renderSkeletonImageThumbnail(size);
    } else if (mediaType === "audio") {
        return renderUrlAudioComponent();
    } else if (mediaType === "video") {
        return renderUrlVideo(size);
    } else {
        return renderUrlFile(size);
    }
}

function renderUrlFile(size: PreviewSize) {

    const classes = useStyles();

    return (
        <div
            className={(classes as any)}
            style={{
                width: getThumbnailMeasure(size),
                height: getThumbnailMeasure(size)
            }}>
            {renderSkeletonIcon()}
        </div>
    );
}

export function renderSkeletonText(index?: number) {
    return <Skeleton variant="text"/>;
}

export function renderSkeletonCaptionText(index?: number) {
    return <Skeleton
        height={20}
        variant="text"/>;
}

export function renderSkeletonIcon() {
    return <Skeleton variant="rect" width={24} height={24}/>;
}

