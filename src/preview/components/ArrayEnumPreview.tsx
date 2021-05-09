import {
    EnumValues,
    NumberProperty,
    PreviewComponentProps,
    StringProperty
} from "../../models";

import React from "react";
import ErrorBoundary from "../../components/ErrorBoundary";
import { EnumValuesChip } from "./CustomChip";
import { useStyles } from "./styles";
import { useTranslation } from "react-i18next";


export function ArrayPropertyEnumPreview({
                                             name,
                                             value,
                                             property,
                                             size
                                         }: PreviewComponentProps<string[] | number[]>) {
    const { t } = useTranslation();

    if (property.dataType !== "array")
        throw Error(t("errorPickedWrongPreviewComponent", { component: "ArrayEnumPreview" }));

    const ofProperty = property.of as StringProperty | NumberProperty;
    if (!ofProperty.config?.enumValues)
        throw Error(t("errorPickedWrongPreviewComponent", { component: "ArrayEnumPreview" }));

    if (!value) return null;

    const enumValues = ofProperty.config?.enumValues;

    return <ArrayEnumPreview name={name} value={value} enumValues={enumValues}
                             size={size}/>;
}

export function ArrayEnumPreview({
                                     name,
                                     value,
                                     enumValues,
                                     size
                                 }: {
    value: string[] | number[],
    name: string | undefined,
    enumValues: EnumValues,
    size: "regular" | "small" | "tiny"
}) {

    const classes = useStyles();

    return (
        <div className={classes.arrayRoot}>
            {value &&
            (value as any[]).map((enumKey, index) => {
                    return (
                        <div className={classes.arrayItem}
                             key={`preview_array_ref_${name}_${index}`}>
                            <ErrorBoundary>
                                <EnumValuesChip
                                    enumKey={enumKey}
                                    enumValues={enumValues}
                                    small={size !== "regular"}/>
                            </ErrorBoundary>
                        </div>
                    );
                }
            )}
        </div>
    );
}
