import React from "react";

import { Field, FormexFieldProps, getIn, useFormex } from "@firecms/formex";
import { DebouncedTextField } from "@firecms/ui";
import { GeneralPropertyValidation } from "./GeneralPropertyValidation";
import { SwitchControl } from "../../SwitchControl";
import { useTranslation } from "@firecms/core";

export function NumberPropertyValidation({ disabled }: {
    disabled: boolean;
}) {

    const {
        values,
        handleChange
    } = useFormex();

    const { t } = useTranslation();

    const validationMin = "validation.min";
    const validationMax = "validation.max";
    const validationLessThan = "validation.lessThan";
    const validationMoreThan = "validation.moreThan";
    const validationPositive = "validation.positive";
    const validationNegative = "validation.negative";
    const validationInteger = "validation.integer";

    return (

        <div className={"grid grid-cols-12 gap-2"}>
            <GeneralPropertyValidation disabled={disabled}/>


            <div className={"col-span-6"}>
                <DebouncedTextField value={getIn(values, validationMin)}
                                    label={t("min_value")}
                                    name={validationMin}
                                    type="number"
                                    size="small"
                                    disabled={disabled}
                                    onChange={handleChange}/>
            </div>

            <div className={"col-span-6"}>
                <DebouncedTextField value={getIn(values, validationMax)}
                                    label={t("max_value")}
                                    name={validationMax}
                                    type="number"
                                    size="small"

                                    disabled={disabled}
                                    onChange={handleChange}/>
            </div>


            <div className={"col-span-6"}>
                <DebouncedTextField
                    value={getIn(values, validationLessThan)}
                    label={t("less_than")}
                    name={validationLessThan}
                    type="number"
                    size="small"

                    disabled={disabled}
                    onChange={handleChange}/>
            </div>

            <div className={"col-span-6"}>
                <DebouncedTextField
                    value={getIn(values, validationMoreThan)}
                    label={t("more_than")}
                    name={validationMoreThan}
                    type="number"
                    size="small"

                    disabled={disabled}
                    onChange={handleChange}/>
            </div>

            <div className={"col-span-4"}>
                <Field name={validationPositive}
                       type="checkbox">
                    {({ field, form }: FormexFieldProps) => {
                        return <SwitchControl
                            label={t("positive_value")}
                            disabled={disabled}
                            form={form}
                            field={field}/>
                    }}
                </Field>
            </div>
            <div className={"col-span-4"}>
                <Field name={validationNegative}
                       type="checkbox">
                    {({ field, form }: FormexFieldProps) => {
                        return <SwitchControl
                            label={t("negative_value")}
                            disabled={disabled}
                            form={form}
                            field={field}/>
                    }}
                </Field>
            </div>
            <div className={"col-span-4"}>
                <Field name={validationInteger}
                       type="checkbox">
                    {({ field, form }: FormexFieldProps) => {
                        return <SwitchControl
                            label={t("integer_value")}
                            disabled={disabled}
                            form={form}
                            field={field}/>
                    }}
                </Field>
            </div>
        </div>
    );
}
