import React from "react";
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Typography
} from "@mui/material";

import { PropertyPreview, PropertyPreviewProps } from "../index";
import { ResolvedMapProperty } from "../../models";
import { ErrorBoundary } from "../../core";

/**
 * @category Preview components
 */
export function MapPropertyPreview<T extends Record<string, unknown>>({
                                                                          propertyKey,
                                                                          value,
                                                                          property,
                                                                          entity,
                                                                          size
                                                                      }: PropertyPreviewProps<T>) {

    if (property.dataType !== "map") {
        throw Error("Picked wrong preview component MapPropertyPreview");
    }

    const mapProperty = property as ResolvedMapProperty;
    if (!mapProperty.properties) {
        throw Error(`You need to specify a 'properties' prop (or specify a custom field) in your map property ${propertyKey}`);
    }

    if (!value) return null;

    let mapPropertyKeys: string[];
    if (size === "regular") {
        mapPropertyKeys = Object.keys(mapProperty.properties);
    } else {
        mapPropertyKeys = (mapProperty.previewProperties || Object.keys(mapProperty.properties)) as string[];
        if (size === "small")
            mapPropertyKeys = mapPropertyKeys.slice(0, 3);
        else if (size === "tiny")
            mapPropertyKeys = mapPropertyKeys.slice(0, 1);
    }

    if (size !== "regular")
        return (
            <Box sx={theme => ({
                width: "100%",
                display: "flex",
                flexDirection: "column",
                "& > *": {
                    [theme.breakpoints.down("md")]: {
                        marginBottom: `${theme.spacing(0.5)} !important`
                    },
                    marginBottom: `${theme.spacing(1)} !important`
                }
            })}>
                {mapPropertyKeys.map((key, index) => (
                    <div>
                        <ErrorBoundary
                            key={"map_preview_" + mapProperty.name + key + index}>
                            <PropertyPreview propertyKey={key}
                                             value={(value as any)[key]}
                                             property={mapProperty.properties![key]}
                                             entity={entity}
                                             size={size}/>
                        </ErrorBoundary>
                    </div>
                ))}
            </Box>
        );

    return (
        <Table size="small" key={`map_preview_${propertyKey}`}>
            <TableBody>
                {mapPropertyKeys &&
                mapPropertyKeys.map((key, index) => {
                    return (
                        <TableRow
                            key={`map_preview_table_${propertyKey}_${index}`}
                            sx={{
                                "&:last-child th, &:last-child td": {
                                    borderBottom: 0
                                }
                            }}>
                            <TableCell key={`table-cell-title-${propertyKey}-${key}`}
                                       sx={{
                                           verticalAlign: "top"
                                       }}
                                       width="30%"
                                       component="th">
                                <Typography variant={"caption"}
                                            color={"textSecondary"}>
                                    {mapProperty.properties![key].name}
                                </Typography>
                            </TableCell>
                            <TableCell key={`table-cell-${propertyKey}-${key}`}
                                       width="70%"
                                       component="th">
                                <ErrorBoundary>
                                    <PropertyPreview
                                        propertyKey={key}
                                        value={(value as any)[key]}
                                        property={mapProperty.properties![key]}
                                        entity={entity}
                                        size={"small"}/>
                                </ErrorBoundary>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );

}
