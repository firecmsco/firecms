import React from "react";
import { FastField, getIn, useFormikContext } from "formik";

import { GeneralPropertyValidation } from "./validation/GeneralPropertyValidation";
import { ValidationPanel } from "./validation/ValidationPanel";
import { SwitchControl } from "@firecms/core";

export function BooleanPropertyField({ disabled }: {
    disabled: boolean;
}) {
    const { values } = useFormikContext();
    const defaultValue = getIn(values, "defaultValue");

    return (
        <>
            <div className={"col-span-12"}>

                <ValidationPanel>
                    <GeneralPropertyValidation disabled={disabled}/>
                </ValidationPanel>

            </div>

            <div className={"col-span-12"}>

                <FastField type="checkbox"
                           name={"defaultValue"}
                           label={defaultValue === null || defaultValue === undefined ? "Default value not set" : ("Default value is " + defaultValue.toString())}
                           disabled={disabled}
                           allowIndeterminate={true}
                           component={SwitchControl}/>

            </div>
        </>
    );
}
