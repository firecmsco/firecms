import React from "react";

import { Box, IconButton, Paper, Tooltip } from "@mui/material";
import { Entity, ResolvedStringProperty } from "../../types";
import RemoveIcon from "@mui/icons-material/Remove";
import { PreviewSize, PropertyPreview } from "../../preview";

import { ErrorBoundary } from "../../core";

interface StorageItemPreviewProps {
    name: string;
    property: ResolvedStringProperty;
    value: string,
    entity: Entity<any>,
    onRemove: (value: string) => void;
    size: PreviewSize;
    disabled: boolean;
}

export function StorageItemPreview({
                                       name,
                                       property,
                                       value,
                                       entity,
                                       onRemove,
                                       disabled,
                                       size
                                   }: StorageItemPreviewProps) {

    return (
        <Box m={1} position={"relative"}>

            <Paper
                elevation={0}
                sx={{
                    padding: 1,
                    boxSizing: "border-box",
                    minWidth: size === "regular" ? 220 : 118,
                    minHeight: size === "regular" ? 220 : 118
                }}
                variant={"outlined"}>

                {!disabled &&
                    <Box
                        sx={(theme) => ({
                            position: "absolute",
                            borderRadius: "9999px",
                            top: -8,
                            right: -8,
                            zIndex: 1,
                            backgroundColor: theme.palette.background.paper
                        })}>

                        <Tooltip
                            title="Remove">
                            <IconButton
                                size={"small"}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onRemove(value);
                                }}>
                                <RemoveIcon fontSize={"small"}/>
                            </IconButton>
                        </Tooltip>
                    </Box>
                }

                {value &&
                    <ErrorBoundary>
                        <PropertyPreview propertyKey={name}
                                         value={value}
                                         property={property}
                                         entity={entity}
                                         size={size}/>
                    </ErrorBoundary>
                }

            </Paper>

        </Box>
    );

}
