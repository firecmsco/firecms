import React from "react";
import { StringPropertyValidation } from "./validation/StringPropertyValidation";
import { ValidationPanel } from "./validation/ValidationPanel";
import { getIn, useFormex } from "@firecms/formex";

import { TextField } from "@firecms/ui";

export function StringPropertyField({
                                        widgetId,
                                        disabled,
                                        showErrors
                                    }: {
    widgetId: "text_field" | "multiline" | "email";
    disabled: boolean;
    showErrors: boolean;
}) {

    const { values, setFieldValue } = useFormex();

    return (
        <>
            <div className={"col-span-12"}>

                <ValidationPanel>

                    {widgetId === "text_field" &&
                        <StringPropertyValidation disabled={disabled}
                                                  length={true}
                                                  lowercase={true}
                                                  matches={true}
                                                  max={true}
                                                  min={true}
                                                  trim={true}
                                                  uppercase={true}
                                                  showErrors={showErrors}/>}
                    {widgetId === "multiline" &&
                        <StringPropertyValidation disabled={disabled}
                                                  length={true}
                                                  lowercase={true}
                                                  max={true}
                                                  min={true}
                                                  trim={true}
                                                  uppercase={true}
                                                  showErrors={showErrors}/>}

                    {widgetId === "email" &&
                        <StringPropertyValidation disabled={disabled}
                                                  max={true}
                                                  min={true}
                                                  trim={true}
                                                  showErrors={showErrors}/>}

                </ValidationPanel>

            </div>

            <div className={"col-span-12"}>

                <TextField name={"defaultValue"}
                           disabled={disabled}
                           onChange={(e: any) => {
                               setFieldValue("defaultValue", e.target.value === "" ? undefined : e.target.value);
                           }}
                           label={"Default value"}
                           value={getIn(values, "defaultValue") ?? ""}/>

            </div>
        </>
    );
}
