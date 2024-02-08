import React from "react";
import { NumberPropertyValidation } from "./validation/NumberPropertyValidation";
import { ValidationPanel } from "./validation/ValidationPanel";
import { TextField } from "@firecms/ui";
import { getIn, useFormex } from "../../../form";

export function NumberPropertyField({ disabled }: {
    disabled: boolean;
}) {

    const { values, setFieldValue } = useFormex();

    return (
        <>

            <div className={"col-span-12"}>

                <ValidationPanel>
                    <NumberPropertyValidation disabled={disabled}/>
                </ValidationPanel>

            </div>

            <div className={"col-span-12"}>

                <TextField name={"defaultValue"}
                           disabled={disabled}
                           type={"number"}
                           onChange={(e: any) => {
                               setFieldValue("defaultValue", e.target.value === "" ? undefined : parseFloat(e.target.value));
                           }}
                           label={"Default value"}
                           value={getIn(values, "defaultValue") ?? ""}/>

            </div>
        </>
    );
}
