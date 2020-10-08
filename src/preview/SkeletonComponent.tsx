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
    Box,
    createStyles,
    Divider,
    Grid,
    List,
    ListItem,
    makeStyles,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Theme
} from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        tableNoBottomBorder: {
            "&:last-child th, &:last-child td": {
                borderBottom: 0
            }
        }
    })
);

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

        if ("dataType" in arrayProperty.of) {
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
        } else {
            content = renderShapedArray(arrayProperty.of);
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
                {mapProperties && mapProperties.map((key: string) => (
                    <ListItem key={property.title + key}>
                        <SkeletonComponent
                            property={property.properties[key]}
                            small={true}/>
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
                                <Skeleton variant="text"/>
                            </TableCell>
                            <TableCell key={`table-cell-${key}`} component="th">
                                <SkeletonComponent
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

function renderArrayOfMaps<P extends Properties>(properties: P, small: boolean, previewProperties?: (keyof P)[]) {
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

function renderShapedArray<T extends EnumType>(
    properties: Property[]
) {

    return (
        <Grid>
            {properties &&
            properties.map((property, index) =>
                <React.Fragment
                    key={"preview_array_" + properties[index] + "_" + index}>
                    {properties[index] && <Box m={1}>
                        <SkeletonComponent
                            property={property}
                            small={true}/>
                    </Box>}
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

