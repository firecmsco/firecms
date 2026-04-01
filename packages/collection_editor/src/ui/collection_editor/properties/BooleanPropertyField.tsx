import React from "react";
import { Field, FormexFieldProps, getIn, useFormex } from "@firecms/formex";

import { GeneralPropertyValidation } from "./validation/GeneralPropertyValidation";
import { ValidationPanel } from "./validation/ValidationPanel";
import { SwitchControl } from "../SwitchControl";
import { useTranslation } from "@firecms/core";

export function BooleanPropertyField({ disabled }: {
    disabled: boolean;
}) {
    const { values } = useFormex();
    const { t } = useTranslation();
    const defaultValue = getIn(values, "defaultValue");

    return (
        <>
            <div className={"col-span-12"}>

                <ValidationPanel>
                    <GeneralPropertyValidation disabled={disabled}/>
                </ValidationPanel>

            </div>

            <div className={"col-span-12"}>

                <Field
                    name={"defaultValue"}>
                    {({ field, form }: FormexFieldProps) => {
                        return <SwitchControl
                            size={"medium"}
                            label={defaultValue === null || defaultValue === undefined ? t("default_value_not_set") : t("default_value_is", { value: defaultValue.toString() })}
                            disabled={disabled}
                            allowIndeterminate={true} field={field}
                            form={form}/>
                    }}
                </Field>

            </div>
        </>
    );
}
