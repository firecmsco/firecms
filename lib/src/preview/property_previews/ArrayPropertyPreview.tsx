import React from "react";

import { Box, Divider } from "@mui/material";

import { PreviewSize, PropertyPreview, PropertyPreviewProps } from "../index";
import { ErrorBoundary, resolveArrayProperty } from "../../core";
import { ResolvedProperty } from "../../types";
import { useFireCMSContext } from "../../hooks";

/**
 * @category Preview components
 */
export function ArrayPropertyPreview({
                                         propertyKey,
                                         value,
                                         property: inputProperty,
                                         entity,
                                         size
                                     }: PropertyPreviewProps<any[]>) {

    const fireCMSContext = useFireCMSContext();
    const property = resolveArrayProperty({
        propertyKey,
        property: inputProperty,
        propertyValue: value,
        fields: fireCMSContext.fields
    });

    if (!property.of) {
        throw Error(`You need to specify an 'of' prop (or specify a custom field) in your array property ${propertyKey}`);
    }

    if (property.dataType !== "array")
        throw Error("Picked wrong preview component ArrayPreview");

    const values = value;

    if (!values) return null;

    const childSize: PreviewSize = size === "regular" ? "small" : "tiny";

    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column"
        }}>
            {values &&
                values.map((value, index) => {
                    const of:ResolvedProperty = property.resolvedProperties[index] ??
                        (property.resolvedProperties[index] ?? (Array.isArray(property.of) ? property.of[index] : property.of));
                    return of
                        ? <React.Fragment
                            key={"preview_array_" + value + "_" + index}>
                            <Box sx={{
                                margin: 1
                            }}>
                                <ErrorBoundary>
                                    <PropertyPreview
                                        propertyKey={propertyKey}
                                        entity={entity}
                                        value={value}
                                        property={of}
                                        size={childSize}/>
                                    </ErrorBoundary>
                                </Box>
                                {index < values.length - 1 && <Divider/>}
                            </React.Fragment>
                            : null;
                    }
                )}
        </Box>
    );
}
