import React from "react";
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Typography
} from "@mui/material";

import { ResolvedMapProperty } from "../../types";
import { ErrorBoundary } from "../../core";
import { PropertyPreviewProps } from "../PropertyPreviewProps";
import { PropertyPreview } from "../PropertyPreview";

/**
 * @category Preview components
 */
export function MapPropertyPreview<T extends Record<string, any> = Record<string, any>>({
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
        return (
            <KeyValuePreview value={value}/>
        );
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
                    <div key={`map_${key}`}>
                        <ErrorBoundary
                            key={"map_preview_" + mapProperty.name + key + index}>
                            <PropertyPreview propertyKey={key}
                                             value={(value)[key]}
                                             property={mapProperty.properties![key]}
                                             entity={entity}
                                             size={size}/>
                        </ErrorBoundary>
                    </div>
                ))}
            </Box>
        );

    return (
        <Box
            sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
            {mapPropertyKeys &&
                mapPropertyKeys.map((key, index) => {
                    return (
                        <Box
                            key={`map_preview_table_${key}}`}
                            sx={theme => ({
                                display: "flex",
                                flexDirection: "row",
                                pt: 0.5,
                                "&:not(:last-child)": {
                                    borderBottom: `1px solid ${theme.palette.divider}`,
                                    pb: 0.5
                                }
                            })}>
                            <Box
                                key={`table-cell-title-${key}-${key}`}
                                sx={{
                                    width: "25%",
                                    verticalAlign: "top",
                                    pr: 1
                                }}>
                                <Typography variant={"caption"}
                                            className={"mono"}
                                            color={"textSecondary"}>
                                    {mapProperty.properties![key].name}
                                </Typography>
                            </Box>
                            <Box
                                sx={{
                                    flexGrow: 1
                                }}>
                                <ErrorBoundary>
                                    <PropertyPreview
                                        propertyKey={key}
                                        value={(value)[key]}
                                        property={mapProperty.properties![key]}
                                        entity={entity}
                                        size={"small"}/>
                                </ErrorBoundary>
                            </Box>
                        </Box>
                    );
                })}
        </Box>
    );

}

export function KeyValuePreview({ value }: { value: any }) {
    if (typeof value !== "object") return null;
    return <Box
        sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
        {
            Object.entries(value).map(([key, childValue]) => (
                <Box
                    key={`map_preview_table_${key}}`}
                    sx={theme => ({
                        display: "flex",
                        flexDirection: "row",
                        pt: 0.5,
                        "&:not(:last-child)": {
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            pb: 0.5
                        }
                    })}>
                    <Box
                        key={`table-cell-title-${key}-${key}`}
                        sx={{
                            width: "25%",
                            verticalAlign: "top",
                            pr: 1
                        }}>
                        <Typography variant={"caption"}
                                    className={"mono"}
                                    color={"textSecondary"}>
                            {key}
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            flexGrow: 1
                        }}>
                        <Typography
                            variant={"caption"}
                            className={"mono"}>
                            <ErrorBoundary>
                                {JSON.stringify(childValue)}
                            </ErrorBoundary>
                        </Typography>
                    </Box>
                </Box>
            ))
        }
    </Box>;
}
