import React from "react";

import {
    PreviewComponent,
    PreviewComponentProps,
    PreviewSize
} from "../internal";
import { ErrorBoundary } from "../../core/internal/ErrorBoundary";
import { useStyles } from "./styles";
import { ResolvedProperty } from "../../models";

/**
 * @category Preview components
 */
export function ArrayOfStorageComponentsPreview({
                                                    name,
                                                    value,
                                                    property,
                                                    size
                                                }: PreviewComponentProps<any[]>) {

    if (property.dataType !== "array" || !property.of || property.of.dataType !== "string")
        throw Error("Picked wrong preview component ArrayOfStorageComponentsPreview");

    const childSize: PreviewSize = size === "regular" ? "small" : "tiny";
    const classes = useStyles();

    return <div className={classes.arrayWrap}>
        {value &&
        value.map((v, index) =>
            <div className={classes.arrayItem}
                 key={`preview_array_storage_${name}_${index}`}>
                <ErrorBoundary>
                    <PreviewComponent
                        name={name}
                        value={v}
                        property={property.of as ResolvedProperty<string>}
                        size={childSize}/>
                </ErrorBoundary>
            </div>
        )}
    </div>;
}
