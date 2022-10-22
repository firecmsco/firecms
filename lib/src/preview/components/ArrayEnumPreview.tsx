import React from "react";

import { EnumValueConfig } from "../../types";
import { ErrorBoundary } from "../../core";
import { EnumValuesChip } from "./ColorChip";
import { Box } from "@mui/material";
import { PreviewSize } from "../PropertyPreviewProps";

/**
 * @category Preview components
 */
export function ArrayEnumPreview({
                                     name,
                                     value,
                                     enumValues,
                                     size
                                 }: {
    value: string[] | number[],
    name: string | undefined,
    enumValues: EnumValueConfig[],
    size: PreviewSize
}) {

    return (
        <Box sx={theme => ({
            display: "flex",
            flexWrap: "wrap",
            gap: theme.spacing(0.5)
        })}>
            {value && value.map((enumKey, index) => {
                    return (
                        <ErrorBoundary
                            key={`preview_array_ref_${name}_${index}`}>
                            <EnumValuesChip
                                enumKey={enumKey}
                                enumValues={enumValues}
                                small={size !== "regular"}/>
                        </ErrorBoundary>
                    );
                }
                )}
        </Box>
    );
}
