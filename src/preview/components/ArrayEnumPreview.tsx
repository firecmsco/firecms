import { EnumValues } from "../../models";

import React from "react";

import { ErrorBoundary } from "../../core/internal/ErrorBoundary";
import { EnumValuesChip } from "./CustomChip";
import { Theme } from "@mui/material";

import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        arrayWrap: {
            display: "flex",
            flexWrap: "wrap"
        },
        arrayItem: {
            margin: theme.spacing(0.5)
        }
    })
);

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
    enumValues: EnumValues,
    size: "regular" | "small" | "tiny"
}) {

    const classes = useStyles();

    return (
        <div className={classes.arrayWrap}>
            {value &&
            (value as any[]).map((enumKey, index) => {
                    return (
                        <div className={classes.arrayItem}
                             key={`preview_array_ref_${name}_${index}`}>
                            <ErrorBoundary>
                                <EnumValuesChip
                                    enumKey={enumKey}
                                    enumValues={enumValues}
                                    small={size !== "regular"}/>
                            </ErrorBoundary>
                        </div>
                    );
                }
            )}
        </div>
    );
}
