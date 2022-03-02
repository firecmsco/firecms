import React from "react";

import { Box, Divider } from "@mui/material";

import {
    PropertyPreview,
    PropertyPreviewProps,
    PreviewSize
} from "../internal";
import { ErrorBoundary } from "../../core/internal/ErrorBoundary";
import { ResolvedProperty } from "../../models";

/**
 * @category Preview components
 */
export function ArrayPropertyPreview({
                                 propertyKey,
                                 value,
                                 property,
                                 size
                             }: PropertyPreviewProps<any[]>) {

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
                values.map((value, index) =>
                    <React.Fragment
                        key={"preview_array_" + value + "_" + index}>
                        <Box sx={{
                            margin: 1
                        }}>
                            <ErrorBoundary>
                                <PropertyPreview
                                    propertyKey={propertyKey}
                                    value={value}
                                    property={property.of as ResolvedProperty<any>}
                                    size={childSize}/>
                            </ErrorBoundary>
                        </Box>
                        {index < values.length - 1 && <Divider/>}
                    </React.Fragment>
                )}
        </Box>
    );
}
