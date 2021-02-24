import {
    PreviewComponentFactoryProps,
    PreviewComponentProps,
    PreviewSize
} from "../../models/preview_component_props";

import React from "react";
import ErrorBoundary from "../../components/ErrorBoundary";
import { useStyles } from "./styles";


export function ArrayOfStorageComponentsPreview({
                                                    name,
                                                    value,
                                                    property,
                                                    size,
                                                    PreviewComponent
                                                }: PreviewComponentProps<any[]> & PreviewComponentFactoryProps) {

    if (property.dataType !== "array" || property.of.dataType !== "string")
        throw Error("Picked wrong preview component ArrayOfStorageComponentsPreview");

    const childSize: PreviewSize = size === "regular" ? "small" : "tiny";
    const classes = useStyles();

    return <div className={classes.arrayRoot}>
        {value &&
        value.map((v, index) =>
            <div className={classes.arrayItem}
                 key={`preview_array_storage_${name}_${index}`}>
                <ErrorBoundary>
                    <PreviewComponent
                        name={name}
                        value={v}
                        property={property.of}
                        size={childSize}/>
                </ErrorBoundary>
            </div>
        )}
    </div>;
}
