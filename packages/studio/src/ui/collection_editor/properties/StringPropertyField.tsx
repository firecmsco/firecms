import React from "react";
import { StringPropertyValidation } from "./validation/StringPropertyValidation";
import { ValidationPanel } from "./validation/ValidationPanel";
import { getIn, useFormex } from "@rebasepro/formex";
import { FieldCaption } from "@rebasepro/core";
import { Select, SelectItem, TextField } from "@rebasepro/ui";

export function StringPropertyField({
    widgetId,
    disabled,
    showErrors
}: {
    widgetId: "text_field" | "multiline" | "email" | "user_select";
    disabled: boolean;
    showErrors: boolean;
}) {

    const { values, setFieldValue, touched, errors } = useFormex();

    const columnTypePath = "columnType";
    const columnTypeValue: string | undefined = getIn(values, columnTypePath);
    const columnTypeError: string | undefined = getIn(touched, columnTypePath) && getIn(errors, columnTypePath);

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
                            showErrors={showErrors} />}
                    {widgetId === "user_select" &&
                        <StringPropertyValidation disabled={disabled}
                            showErrors={showErrors} />}

                    {widgetId === "multiline" &&
                        <StringPropertyValidation disabled={disabled}
                            length={true}
                            lowercase={true}
                            max={true}
                            min={true}
                            trim={true}
                            uppercase={true}
                            showErrors={showErrors} />}

                    {widgetId === "email" &&
                        <StringPropertyValidation disabled={disabled}
                            max={true}
                            min={true}
                            trim={true}
                            showErrors={showErrors} />}

                </ValidationPanel>

            </div>
            
            <div className={"col-span-12"}>
                <Select name={columnTypePath}
                    disabled={disabled}
                    size={"large"}
                    fullWidth={true}
                    value={columnTypeValue ?? "_default_"}
                    onValueChange={(v) => setFieldValue(columnTypePath, v === "_default_" ? undefined : v)}
                    renderValue={(v) => {
                        switch (v) {
                            case "text": return "text (unlimited)";
                            case "char": return "char (fixed length)";
                            case "varchar": return "varchar (variable length)";
                            case "_default_": return "Default (varchar/uuid)";
                            default: return "Default (varchar/uuid)";
                        }
                    }}
                    error={Boolean(columnTypeError)}
                    label={"Database Column Type"}>
                    <SelectItem value={"_default_"}> Default (varchar/uuid) </SelectItem>
                    <SelectItem value={"varchar"}> varchar (variable length) </SelectItem>
                    <SelectItem value={"text"}> text (unlimited) </SelectItem>
                    <SelectItem value={"char"}> char (fixed length) </SelectItem>
                </Select>
                <FieldCaption error={Boolean(columnTypeError)}>
                    {columnTypeError ?? "Optional database override for this string field."}
                </FieldCaption>
            </div>

            <div className={"col-span-12"}>

                <TextField name={"defaultValue"}
                    disabled={disabled}
                    onChange={(e: any) => {
                        setFieldValue("defaultValue", e.target.value === "" ? undefined : e.target.value);
                    }}
                    label={"Default value"}
                    value={getIn(values, "defaultValue") ?? ""} />

            </div>
        </>
    );
}
