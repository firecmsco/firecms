import { ReferenceProperty } from "../../models";
import {
    PreviewComponentFactoryProps,
    PreviewComponentProps,
    PreviewSize
} from "../../models/preview_component_props";

import React from "react";
import { default as ReferencePreview } from "./ReferencePreview";
import { useStyles } from "./styles";

export function ArrayOfReferencesPreview({
                                             name,
                                             value,
                                             property,
                                             size,
                                             entitySchema,
                                             PreviewComponent
                                         }: PreviewComponentProps<any[]> & PreviewComponentFactoryProps) {

    if (property.dataType !== "array" || property.of.dataType !== "reference")
        throw Error("Picked wrong preview component ArrayOfReferencesPreview");

    const classes = useStyles();
    const childSize: PreviewSize = size === "regular" ? "small" : "tiny";

    return (
        <>
            {value &&
            value.map((v, index) =>
                <div className={classes.arrayItem} key={`preview_array_ref_${name}_${index}`}>
                    <ReferencePreview
                        name={`${name}[${index}]`}
                        entitySchema={entitySchema}
                        size={childSize}
                        value={v}
                        property={property.of as ReferenceProperty}
                        PreviewComponent={PreviewComponent}
                    />
                </div>
            )}
        </>
    );
}
