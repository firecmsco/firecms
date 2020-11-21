import { ReferenceProperty } from "../../models";
import {
    PreviewComponentFactoryProps,
    PreviewComponentProps,
    PreviewSize
} from "../PreviewComponentProps";

import React from "react";

import { Box } from "@material-ui/core";
import { ReferencePreview } from "./ReferencePreview";


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

    const childSize: PreviewSize = size === "regular" ? "small" : "tiny";

    return (
        <Box>
            {value &&
            value.map((v, index) =>
                <Box m={0.2} key={`preview_array_ref_${name}_${index}`}>
                    <ReferencePreview
                        name={`${name}[${index}]`}
                        entitySchema={entitySchema}
                        size={childSize}
                        value={v}
                        property={property.of as ReferenceProperty}
                        PreviewComponent={PreviewComponent}
                    />
                </Box>
            )}
        </Box>
    );
}
