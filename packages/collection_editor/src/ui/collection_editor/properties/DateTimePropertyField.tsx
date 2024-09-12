import React from "react";
import { getIn, useFormex } from "@firecms/formex";
import { FieldCaption, NumberProperty, StringProperty } from "@firecms/core";
import { Select, SelectItem } from "@firecms/ui";
import { GeneralPropertyValidation } from "./validation/GeneralPropertyValidation";
import { ValidationPanel } from "./validation/ValidationPanel";

export function DateTimePropertyField({ disabled }: {
    disabled: boolean;
}) {

    const {
        values,
        errors,
        touched,
        setFieldValue
    } = useFormex<StringProperty | NumberProperty>();

    const modePath = "mode";
    const modeValue: string | undefined = getIn(values, modePath);
    const modeError: string | undefined = getIn(touched, modePath) && getIn(errors, modePath);

    const autoValuePath = "autoValue";
    const autoValueValue: string | undefined = getIn(values, autoValuePath);
    const autoValueError: string | undefined = getIn(touched, autoValuePath) && getIn(errors, autoValuePath);

    return (
        <>
            <div className={"flex flex-col col-span-12 gap-2"}>
                <div>
                    <Select name={modePath}
                            value={modeValue ?? "date"}
                            error={Boolean(modeError)}
                            onValueChange={(v) => setFieldValue(modePath, v)}
                            label={"Mode"}
                            renderValue={(v) => {
                                switch (v) {
                                    case "date_time":
                                        return "Date/Time";
                                    case "date":
                                        return "Date";
                                    default:
                                        return "";
                                }
                            }}
                            disabled={disabled}>
                        <SelectItem value={"date_time"}> Date/Time </SelectItem>
                        <SelectItem value={"date"}> Date </SelectItem>
                    </Select>
                    <FieldCaption error={Boolean(modeError)}>
                        {modeError}
                    </FieldCaption>
                </div>
                <div>
                    <Select name={autoValuePath}
                            disabled={disabled}
                            value={autoValueValue ?? ""}
                            onValueChange={(v) => setFieldValue(autoValuePath, v === "none" ? null : v)}
                            renderValue={(v) => {
                                switch (v) {
                                    case "on_create":
                                        return "On create";
                                    case "on_update":
                                        return "On any update";
                                    default:
                                        return "None";
                                }
                            }}
                            error={Boolean(autoValueError)}
                            label={"Automatic value"}>
                        <SelectItem value={"none"}> None </SelectItem>
                        <SelectItem value={"on_create"}> On create </SelectItem>
                        <SelectItem value={"on_update"}> On any update </SelectItem>
                    </Select>
                    <FieldCaption error={Boolean(autoValueError)}>
                        {autoValueError ?? "Update this field automatically when creating or updating the entity"}
                    </FieldCaption>
                </div>

            </div>

            <div className={"col-span-12"}>
                <ValidationPanel>
                    <GeneralPropertyValidation disabled={disabled}/>
                </ValidationPanel>
            </div>
        </>
    );
}
