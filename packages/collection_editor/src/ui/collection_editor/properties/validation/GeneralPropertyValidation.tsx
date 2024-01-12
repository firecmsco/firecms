import React from "react";

import { FastField, getIn, useFormikContext } from "formik";
import { SwitchControl } from "@firecms/core";
import { DebouncedTextField } from "@firecms/ui";

export function GeneralPropertyValidation({ disabled }: {
    required?: boolean;
    disabled:boolean;
}) {

    const { values, handleChange } = useFormikContext();

    const validationRequired = "validation.required";
    const validationRequiredMessage = "validation.requiredMessage";
    const validationUnique = "validation.unique";
    const validationUniqueInArray = "validation.uniqueInArray";

    return (
        <>
            <div className={"col-span-6"}>
                <FastField type="checkbox"
                           disabled={disabled}
                           name={validationRequired}
                           label={"Required"}
                           tooltip={"You won't be able to save this entity if this value is not set"}
                           component={SwitchControl}/>
            </div>

            <div className={"col-span-6"}>
                <FastField type="checkbox"
                           disabled={disabled}
                           name={validationUnique}
                           label={"Unique"}
                           tooltip={"There cannot be multiple entities with the same value"}
                           component={SwitchControl}/>
            </div>

            {getIn(values, validationRequired) && <div className={"col-span-12"}>
                <DebouncedTextField
                    disabled={disabled}
                    value={getIn(values, validationRequiredMessage)}
                    label={"Required message"}
                    name={validationRequiredMessage}
                    size="small"
                    onChange={handleChange}/>
            </div>}
        </>
    );
}
