import React from "react";
import { styled } from '@mui/material/styles';
import { ResolvedStringProperty } from "../../models";
import { PreviewComponentProps } from "../internal";

import { ErrorBoundary } from "../../core/internal/ErrorBoundary";
import { StringPreview } from "./StringPreview";
import { Theme } from "@mui/material";

const PREFIX = 'ArrayOfStringsPreview';

const classes = {
    array: `${PREFIX}-array`,
    arrayWrap: `${PREFIX}-arrayWrap`,
    arrayItem: `${PREFIX}-arrayItem`
};

const Root = styled('div')((
   { theme } : {
        theme: Theme
    }
) => ({
    [`& .${classes.array}`]: {
        display: "flex",
        flexDirection: "column"
    },

    [`& .${classes.arrayWrap}`]: {
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
export function ArrayOfStringsPreview({
                                          name,
                                          value,
                                          property,
                                          size
                                      }: PreviewComponentProps<string[]>) {



    if (!property.of || property.dataType !== "array" || property.of.dataType !== "string")
        throw Error("Picked wrong preview component ArrayOfStringsPreview");

    if (value && !Array.isArray(value)) {
        return <Root>{`Unexpected value: ${value}`}</Root>;
    }
    const stringProperty = property.of as ResolvedStringProperty;

    return (
        <div className={classes.array}>
            {value &&
            value.map((v, index) =>
                <div className={classes.arrayItem}
                     key={`preview_array_strings_${name}_${index}`}>
                    <ErrorBoundary>
                        <StringPreview name={name}
                                       property={stringProperty}
                                       value={v}
                                       size={size}/>
                    </ErrorBoundary>
                </div>
            )}
        </div>
    );
}
