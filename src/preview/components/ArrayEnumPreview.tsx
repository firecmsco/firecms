import {
    PreviewComponentFactoryProps,
    PreviewComponentProps
} from "../PreviewComponentProps";

import React from "react";

import { Box } from "@material-ui/core";
import ErrorBoundary from "../../components/ErrorBoundary";
import { EnumValues, NumberProperty, StringProperty } from "../../models";
import { CustomChip } from "./CustomChip";

export function buildArrayEnumPreview(value: string[] | number[],
                               name: string,
                               enumValues: EnumValues<string> | EnumValues<number>,
                               size: "regular" | "small" | "tiny") {
    return (
        <Box display={"flex"} flexWrap="wrap">
            {value &&
            (value as any[]).map((v, index) => (
                    <Box m={0.2} key={`preview_array_ref_${name}_${index}`}>
                        <ErrorBoundary>
                            <CustomChip
                                colorKey={typeof v == "number" ? `${name}_${v}` : v as string}
                                label={enumValues[v] || v}
                                error={!enumValues[v]}
                                outlined={false}
                                small={size !== "regular"}/>
                        </ErrorBoundary>
                    </Box>
                )
            )}
        </Box>
    );
}

export function ArrayEnumPreview({
                                     name,
                                     value,
                                     property,
                                     size
                                 }: PreviewComponentProps<string[] | number[]> & PreviewComponentFactoryProps) {

    if (property.dataType !== "array")
        throw Error("Picked wrong preview component ArrayEnumPreview");

    const ofProperty = property.of as StringProperty | NumberProperty;
    if (!ofProperty.config?.enumValues)
        throw Error("Picked wrong preview component ArrayEnumPreview");

    if (!value) return null;

    const enumValues = ofProperty.config?.enumValues;

    return buildArrayEnumPreview(value, name, enumValues, size);
}
