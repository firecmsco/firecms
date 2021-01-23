import {
    PreviewComponentFactoryProps,
    PreviewComponentProps
} from "../../models/preview_component_props";

import React from "react";

import ErrorBoundary from "../../components/ErrorBoundary";
import {
    EnumValues,
    NumberProperty,
    StringProperty
} from "../../models";
import { CustomChip } from "./CustomChip";
import { useStyles } from "./styles";


export function buildArrayEnumPreview(value: string[] | number[],
                               name: string,
                               enumValues: EnumValues<string> | EnumValues<number>,
                               size: "regular" | "small" | "tiny") {

    const classes = useStyles();

    return (
        <div className={classes.arrayRoot}>
            {value &&
            (value as any[]).map((v, index) => (
                    <div className={classes.arrayItem} key={`preview_array_ref_${name}_${index}`}>
                        <ErrorBoundary>
                            <CustomChip
                                colorKey={typeof v == "number" ? `${name}_${v}` : v as string}
                                label={enumValues[v] || v}
                                error={!enumValues[v]}
                                outlined={false}
                                small={size !== "regular"}/>
                        </ErrorBoundary>
                    </div>
                )
            )}
        </div>
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
