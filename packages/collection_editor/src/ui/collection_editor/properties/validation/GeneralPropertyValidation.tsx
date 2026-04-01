import React from "react";

import { Field, FormexFieldProps, getIn, useFormex } from "@firecms/formex";
import { DebouncedTextField } from "@firecms/ui";
import { SwitchControl } from "../../SwitchControl";
import { useTranslation } from "@firecms/core";

export function GeneralPropertyValidation({ disabled }: {
    required?: boolean;
    disabled: boolean;
}) {

    const { values, handleChange } = useFormex();
    const { t } = useTranslation();

    const validationRequired = "validation.required";
    const validationRequiredMessage = "validation.requiredMessage";
    const validationUnique = "validation.unique";
    const validationUniqueInArray = "validation.uniqueInArray";

    return (
        <>
            <div className={"col-span-6"}>
                <Field name={validationRequired}
                       type="checkbox">
                    {({ field, form }: FormexFieldProps) => {
                        return <SwitchControl
                            disabled={disabled}
                            label={t("required")}
                            tooltip={t("required_tooltip")}
                            form={form}
                            field={field}/>
                    }}
                </Field>
            </div>

            <div className={"col-span-6"}>

                <Field name={validationUnique}
                       type="checkbox">
                    {({ field, form }: FormexFieldProps) => {
                        return <SwitchControl
                            disabled={disabled}
                            label={t("unique")}
                            tooltip={t("unique_tooltip")}
                            form={form}
                            field={field}/>
                    }}
                </Field>
            </div>

            {getIn(values, validationRequired) && <div className={"col-span-12"}>
                <DebouncedTextField
                    disabled={disabled}
                    value={getIn(values, validationRequiredMessage)}
                    label={t("required_message")}
                    name={validationRequiredMessage}
                    size="small"
                    onChange={handleChange}/>
            </div>}
        </>
    );
}
