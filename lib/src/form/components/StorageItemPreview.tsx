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
                className={`p-1 border-box ${size === "regular" ? "min-w-[220px] min-h-[220px]" : "min-w-[118px] min-h-[118px]"}`}
                variant={"outlined"}>

                {!disabled &&
                    <Box
                        className="absolute rounded-full -top-2 -right-2 z-10 bg-white">

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
