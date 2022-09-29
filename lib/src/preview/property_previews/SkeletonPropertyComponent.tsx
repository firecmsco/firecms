import {
    ResolvedArrayProperty,
    ResolvedMapProperty,
    ResolvedProperties,
    ResolvedProperty,
    ResolvedStringProperty
} from "../../models";
import React from "react";
import {
    Box,
    Grid,
    List,
    ListItem,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableRow
} from "@mui/material";
import { PreviewSize } from "../index";
import { getThumbnailMeasure } from "../util";

export interface SkeletonPropertyComponentProps {
    property: ResolvedProperty,
    size: PreviewSize
}

/**
 * @category Preview components
 */
export function SkeletonPropertyComponent({
                                         property,
                                         size
                                     }: SkeletonPropertyComponentProps
) {

    if (!property) {
        console.error("No property assigned for skeleton component", property, size);
    }

    let content: JSX.Element | any;
    if (property.dataType === "string") {
        const stringProperty = property as ResolvedStringProperty;
        if (stringProperty.url) {
            content = renderUrlComponent(stringProperty, size);
        } else if (stringProperty.storage) {
            content = renderSkeletonImageThumbnail(size);
        } else {
            content = renderSkeletonText();
        }
    } else if (property.dataType === "array") {
        const arrayProperty = property as ResolvedArrayProperty;

        if (arrayProperty.of) {
            if (Array.isArray(arrayProperty.of)) {
                content = <>{arrayProperty.of.map(p => renderGenericArrayCell(p))} </>;
            } else {
                if (arrayProperty.of.dataType === "map" && arrayProperty.of.properties) {
                    content = renderArrayOfMaps(arrayProperty.of.properties, size, arrayProperty.of.previewProperties);
                } else if (arrayProperty.of.dataType === "string") {
                    if (arrayProperty.of.enumValues) {
                        content = renderArrayEnumTableCell();
                    } else if (arrayProperty.of.storage) {
                        content = renderGenericArrayCell(arrayProperty.of);
                    } else {
                        content = renderArrayOfStrings();
                    }
                } else {
                    content = renderGenericArrayCell(arrayProperty.of);
                }
            }
        }

    } else if (property.dataType === "map") {
        content = renderMap(property as ResolvedMapProperty, size);
    } else if (property.dataType === "date") {
        content = renderSkeletonText();
    } else if (property.dataType === "reference") {
        content = renderReference();
    } else if (property.dataType === "boolean") {
        content = renderSkeletonText();
    } else {
        content = renderSkeletonText();
    }
    return (content || null);
}

function renderMap<T extends Record<string, any>>(property: ResolvedMapProperty<T>, size: PreviewSize) {

    if (!property.properties)
        return <></>;

    let mapProperties: string[];
    if (!size) {
        mapProperties = Object.keys(property.properties);
    } else {
        if (property.previewProperties)
            mapProperties = property.previewProperties as unknown as string[];
        else
            mapProperties = Object.keys(property.properties).slice(0, 3);
    }

    if (size)
        return (
            <List>
                {mapProperties && mapProperties.map((key: string) => (
                    <>
                        {property.properties &&
                            <ListItem key={property.name + key}>
                                <SkeletonPropertyComponent
                                    property={property.properties[key]}
                                    size={"small"}/>
                            </ListItem>}
                    </>
                ))}
            </List>
        );

    return (
        <Table size={"small"}>
            <TableBody>
                {mapProperties &&
                mapProperties.map((key, index) => {
                    return (
                        <TableRow key={`table_${property.name}_${index}`}
                                  sx={{
                                      "&:last-child th, &:last-child td": {
                                          borderBottom: 0
                                      }
                                  }}>
                            <TableCell key={`table-cell-title-${key}`}
                                       component="th">
                                <Skeleton variant="text"/>
                            </TableCell>
                            <TableCell key={`table-cell-${key}`} component="th">
                                {property.properties && <SkeletonPropertyComponent
                                    property={property.properties[key]}
                                    size={"small"}/>}
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );

}

function renderArrayOfMaps<M extends Record<string, any>>(properties: ResolvedProperties<M>, size: PreviewSize, previewProperties?: string[]) {
    let tableProperties = previewProperties;
    if (!tableProperties || !tableProperties.length) {
        tableProperties = Object.keys(properties) as string[];
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
                                    (key) => (
                                        <TableCell
                                            key={`table-cell-${key}`}
                                            component="th"
                                        >
                                            <SkeletonPropertyComponent
                                                property={(properties)[key]}
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
                    renderSkeletonText(index)
                ))}
        </Grid>
    );
}

function renderArrayEnumTableCell() {
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
    property: ResolvedProperty
) {
    return (
        <Grid>

            {
                [0, 1].map((value, index) =>
                    <>
                        <SkeletonPropertyComponent property={property}
                                                   size={"small"}/>
                    </>
                )}
        </Grid>
    );
}

function renderUrlAudioComponent() {
    return (
        <Skeleton variant="rectangular"
                  width={300}
                  height={100}/>
    );
}

export function renderSkeletonImageThumbnail(size: PreviewSize) {
    const imageSize = size === "tiny" ? 40 : size === "small" ? 100 : 200;
    return (
        <Skeleton variant="rectangular"
                  sx={theme => ({
                      borderRadius: `${theme.shape.borderRadius}px`
                  })}
                  width={imageSize}
                  height={imageSize}/>
    );
}

function renderUrlVideo(size: PreviewSize) {

    return (
        <Skeleton variant="rectangular"
                  width={size !== "regular" ? 300 : 500}
                  height={size !== "regular" ? 200 : 250}/>
    );
}

function renderReference() {
    return <Skeleton variant="rectangular" width={200} height={100}/>;
}

function renderUrlComponent(property: ResolvedStringProperty, size: PreviewSize = "regular") {

    if (typeof property.url === "boolean") {
        return <div style={{
            display: "flex"
        }}>
            {renderSkeletonIcon()}
            {renderSkeletonText()}
        </div>;
    }

    return renderUrlFile(size);
}

function renderUrlFile(size: PreviewSize) {

    return (
        <Box
            sx={{
                width: getThumbnailMeasure(size),
                height: getThumbnailMeasure(size)
            }}>
            {renderSkeletonIcon()}
        </Box>
    );
}

export function renderSkeletonText(index?: number) {
    return <Skeleton variant="text" key={`skeleton_${index}`}/>;
}

export function renderSkeletonCaptionText(index?: number) {
    return <Skeleton
        height={20}
        variant="text"/>;
}

export function renderSkeletonIcon() {
    return <Skeleton variant="rectangular" width={24} height={24}/>;
}
