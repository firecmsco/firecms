import { StringProperty } from "../../models";
import {
    PreviewComponentFactoryProps,
    PreviewComponentProps
} from "../PreviewComponentProps";

import React from "react";

import { Box } from "@material-ui/core";
import ErrorBoundary from "../../components/ErrorBoundary";
import { StringPreview } from "./StringPreview";


export function ArrayOfStringsPreview({
                                          name,
                                          value,
                                          property,
                                          size,
                                          entitySchema
                                      }: PreviewComponentProps<string[]> & PreviewComponentFactoryProps) {

    if (property.dataType !== "array" || property.of.dataType !== "string")
        throw Error("Picked wrong preview component ArrayOfStringsPreview");

    if (value && !Array.isArray(value)) {
        return <div>{`Unexpected value: ${value}`}</div>;
    }
    const stringProperty = property.of as StringProperty;

    return (
        <Box display={stringProperty.config?.previewAsTag ? "flex" : "block"}
             flexWrap={"wrap"}>
            {value &&
            value.map((v, index) =>
                <Box m={stringProperty.config?.previewAsTag ? 0.2 : 0.5}
                     key={`preview_array_strings_${name}_${index}`}>
                    <ErrorBoundary>
                        <StringPreview name={name}
                                       property={stringProperty}
                                       value={v}
                                       size={size}
                                       entitySchema={entitySchema}/>
                    </ErrorBoundary>
                </Box>
            )}
        </Box>
    );
}
