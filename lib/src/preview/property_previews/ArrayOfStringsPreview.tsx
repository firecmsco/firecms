import React from "react";
import { ResolvedStringProperty } from "../../types";

import { ErrorBoundary, resolveArrayProperty } from "../../core";
import { StringPropertyPreview } from "./StringPropertyPreview";
import { Box, Theme } from "@mui/material";
import { useFireCMSContext } from "../../hooks";
import { PropertyPreviewProps } from "../PropertyPreviewProps";

/**
 * @category Preview components
 */
export function ArrayOfStringsPreview({
                                          propertyKey,
                                          value,
                                          property: inputProperty,
                                          entity,
                                          size
                                      }: PropertyPreviewProps<string[]>) {

    const fireCMSContext = useFireCMSContext();
    const property = resolveArrayProperty({
        propertyKey,
        property: inputProperty,
        propertyValue: value,
        fields: fireCMSContext.fields
    });

    if (Array.isArray(property.of)) {
        throw Error("Using array properties instead of single one in `of` in ArrayProperty");
    }
    if (!property.of || property.dataType !== "array" || property.of.dataType !== "string")
        throw Error("Picked wrong preview component ArrayOfStringsPreview");

    if (value && !Array.isArray(value)) {
        return <div>{`Unexpected value: ${value}`}</div>;
    }
    const stringProperty = property.of as ResolvedStringProperty;

    return (
        <Box sx={{
            display: "flex",
            gap: "2px",
            flexDirection: "column",
        }}>
            {value &&
                value.map((v, index) =>
                    <div key={`preview_array_strings_${propertyKey}_${index}`}>
                        <ErrorBoundary>
                            <StringPropertyPreview propertyKey={propertyKey}
                                                   property={stringProperty}
                                                   value={v}
                                                   entity={entity}
                                                   size={size}/>
                        </ErrorBoundary>
                    </div>
                )}
        </Box>
    );
}
