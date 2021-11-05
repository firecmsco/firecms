import React from "react";
import { StringProperty } from "../../models";
import { PreviewComponentProps } from "../PreviewComponentProps";

import { ErrorBoundary } from "../../core/internal/ErrorBoundary";
import { StringPreview } from "./StringPreview";
import { useStyles } from "./styles";

/**
 * @category Preview components
 */
export function ArrayOfStringsPreview({
                                          name,
                                          value,
                                          property,
                                          size
                                      }: PreviewComponentProps<string[]>) {

    const classes = useStyles();

    if (!property.of || property.dataType !== "array" || property.of.dataType !== "string")
        throw Error("Picked wrong preview component ArrayOfStringsPreview");

    if (value && !Array.isArray(value)) {
        return <div>{`Unexpected value: ${value}`}</div>;
    }
    const stringProperty = property.of as StringProperty;

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
