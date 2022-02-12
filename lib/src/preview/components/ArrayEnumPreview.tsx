import { EnumValueConfig, EnumValues } from "../../models";

import { styled } from '@mui/material/styles';

import React from "react";

import { ErrorBoundary } from "../../core/internal/ErrorBoundary";
import { EnumValuesChip } from "./CustomChip";
import { Theme } from "@mui/material";

const PREFIX = 'ArrayEnumPreview';

const classes = {
    arrayWrap: `${PREFIX}-arrayWrap`,
    arrayItem: `${PREFIX}-arrayItem`
};

const Root = styled('div')((
   { theme } : {
        theme: Theme
    }
) => ({
    [`&.${classes.arrayWrap}`]: {
        display: "flex",
        flexWrap: "wrap"
    },

    [`& .${classes.arrayItem}`]: {
        margin: theme.spacing(0.5)
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
    size: "regular" | "small" | "tiny"
}) {



    return (
        <Root className={classes.arrayWrap}>
            {value &&
            (value as any[]).map((enumKey, index) => {
                    return (
                        <div className={classes.arrayItem}
                             key={`preview_array_ref_${name}_${index}`}>
                            <ErrorBoundary>
                                <EnumValuesChip
                                    enumId={enumKey}
                                    enumValues={enumValues}
                                    small={size !== "regular"}/>
                            </ErrorBoundary>
                        </div>
                    );
                }
            )}
        </Root>
    );
}
