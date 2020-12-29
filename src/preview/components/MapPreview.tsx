import { MapProperty } from "../../models";
import {
    PreviewComponentFactoryProps,
    PreviewComponentProps
} from "../PreviewComponentProps";
import ErrorBoundary from "../../components/ErrorBoundary";
import React from "react";
import {
    createStyles,
    ListItem,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Typography
} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import PreviewComponent from "../PreviewComponent";

const useStyles = makeStyles(() =>
    createStyles({
        tableNoBottomBorder: {
            "&:last-child th, &:last-child td": {
                borderBottom: 0
            }
        }
    })
);

export function MapPreview<T>({
                                  name,
                                  value,
                                  property,
                                  size,
                                  entitySchema,
                                  PreviewComponent
                              }: PreviewComponentProps<T> & PreviewComponentFactoryProps) {

    if (property.dataType !== "map") {
        throw Error("Picked wrong preview component MapPreview");
    }

    const mapProperty = property as MapProperty;

    if (!value) return null;

    const classes = useStyles();

    let mapProperties: string[];
    if (size === "regular") {
        mapProperties = Object.keys(mapProperty.properties);
    } else {
        mapProperties = mapProperty.previewProperties || Object.keys(mapProperty.properties);
        if (size === "small")
            mapProperties = mapProperties.slice(0, 3);
        else if (size === "tiny")
            mapProperties = mapProperties.slice(0, 1);
    }

    if (size !== "regular")
        return (
            <>
                {mapProperties.map((key, index) => (
                    <ListItem
                        key={"map_preview_" + mapProperty.title + key + index}>
                        <ErrorBoundary>
                            <PreviewComponent name={key}
                                              value={value[key] as any}
                                              property={mapProperty.properties[key]}
                                              size={size}
                                              entitySchema={entitySchema}/>
                        </ErrorBoundary>
                    </ListItem>
                ))}
            </>
        );

    return (
        <Table size="small" key={`map_preview_${name}`}>
            <TableBody>
                {mapProperties &&
                mapProperties.map((key, index) => {
                    return (
                        <TableRow
                            key={`map_preview_table_${name}_${index}`}
                            className={classes.tableNoBottomBorder}>
                            <TableCell key={`table-cell-title-${name}-${key}`}
                                       component="th">
                                <Typography variant={"caption"}
                                            color={"textSecondary"}>
                                    {mapProperty.properties[key].title}
                                </Typography>
                            </TableCell>
                            <TableCell key={`table-cell-${name}-${key}`} component="th">
                                <ErrorBoundary>
                                    <PreviewComponent
                                        name={key}
                                        value={value[key] as any}
                                        property={mapProperty.properties[key]}
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
