import React from "react";
import { Field, FormexFieldProps, getIn, useFormex } from "../../../form";

import { GeneralPropertyValidation } from "./validation/GeneralPropertyValidation";
import { ValidationPanel } from "./validation/ValidationPanel";
import { SwitchControl } from "../SwitchControl";

export function BooleanPropertyField({ disabled }: {
    disabled: boolean;
}) {
    const { values } = useFormex();
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
                            label={defaultValue === null || defaultValue === undefined ? "Default value not set" : ("Default value is " + defaultValue.toString())}
                            disabled={disabled}
                            allowIndeterminate={true} field={field}
                            form={form}/>
                    }}
                </Field>

            </div>
        </>
    );
}
