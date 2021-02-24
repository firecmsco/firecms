import {

    PreviewComponentProps
} from "../../models/preview_component_props";

import React from "react";

import ErrorBoundary from "../../components/ErrorBoundary";
import { EnumValues, NumberProperty, StringProperty } from "../../models";
import { CustomChip } from "./CustomChip";
import { useStyles } from "./styles";
import { buildEnumLabel } from "../../models/builders";

export function ArrayEnumPreview({
                                     name,
                                     value,
                                     enumValues,
                                     size
                                 }: {
    value: string[] | number[],
    name: string | undefined,
    enumValues: EnumValues<string> | EnumValues<number>,
    size: "regular" | "small" | "tiny"
}) {

    const classes = useStyles();

    return (
        <div className={classes.arrayRoot}>
            {value &&
            (value as any[]).map((v, index) => {
                const label = buildEnumLabel(enumValues[v]);
                return (
                        <div className={classes.arrayItem}
                             key={`preview_array_ref_${name}_${index}`}>
                            <ErrorBoundary>
                                <CustomChip
                                    colorKey={typeof v == "number" ? `${name}_${v}` : v as string}
                                    label={label|| v}
                                    error={!label}
                                    outlined={false}
                                    small={size !== "regular"}/>
                            </ErrorBoundary>
                        </div>
                    );
                }
            )}
        </div>
    );
}

export function ArrayPropertyEnumPreview({
                                     name,
                                     value,
                                     property,
                                     size
                                 }: PreviewComponentProps<string[] | number[]> ) {

    if (property.dataType !== "array")
        throw Error("Picked wrong preview component ArrayEnumPreview");

    const ofProperty = property.of as StringProperty | NumberProperty;
    if (!ofProperty.config?.enumValues)
        throw Error("Picked wrong preview component ArrayEnumPreview");

    if (!value) return null;

    const enumValues = ofProperty.config?.enumValues;

    return <ArrayEnumPreview name={name} value={value} enumValues={enumValues} size={size}/>
}
