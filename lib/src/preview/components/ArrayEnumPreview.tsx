import { EnumValueConfig } from "../../models";

import { styled } from "@mui/material/styles";

import React from "react";

import { ErrorBoundary } from "../../core";
import { EnumValuesChip } from "./ColorChip";
import { Box, Theme } from "@mui/material";
import { PreviewSize } from "../PropertyPreviewProps";

const PREFIX = "ArrayEnumPreview";

const classes = {
    arrayWrap: `${PREFIX}-arrayWrap`,
    arrayItem: `${PREFIX}-arrayItem`
};

const Root = styled("div")((
   { theme } : {
        theme: Theme
    }
) => ({
    [`& .${classes.arrayItem}`]: {
    }
}));

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
            {value &&
                (value as any[]).map((enumKey, index) => {
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
