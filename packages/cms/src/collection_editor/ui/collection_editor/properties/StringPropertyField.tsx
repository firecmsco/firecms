import { FieldCaption } from "../../../_cms_internals";
import React from "react";
import { StringPropertyValidation } from "./validation/StringPropertyValidation";
import { ValidationPanel } from "./validation/ValidationPanel";
import { getIn, useFormex } from "@rebasepro/formex";
;
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

    const isIdPath = "isId";
    const isIdValue: string | boolean | undefined = getIn(values, isIdPath);
    const isIdError: string | undefined = getIn(touched, isIdPath) && getIn(errors, isIdPath);

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
                    disabled={disabled || Boolean(isIdValue)}
                    fullWidth={true}
                    value={isIdValue === "uuid" ? "uuid" : (columnTypeValue ?? "_default_")}
                    onValueChange={(v) => setFieldValue(columnTypePath, v === "_default_" ? undefined : v)}
                    renderValue={(v) => {
                        if (isIdValue === "uuid") return "uuid (forced by Primary Key)";
                        switch (v) {
                            case "text": return "text (unlimited)";
                            case "char": return "char (fixed length)";
                            case "varchar": return "varchar (variable length)";
                            case "_default_": return "Default (varchar)";
                            default: return "Default (varchar)";
                        }
                    }}
                    error={Boolean(columnTypeError)}
                    label={"Database Column Type"}>
                    {isIdValue === "uuid" && <SelectItem value={"uuid"}> uuid (forced by Primary Key) </SelectItem>}
                    <SelectItem value={"_default_"}> Default (varchar) </SelectItem>
                    <SelectItem value={"varchar"}> varchar (variable length) </SelectItem>
                    <SelectItem value={"text"}> text (unlimited) </SelectItem>
                    <SelectItem value={"char"}> char (fixed length) </SelectItem>
                </Select>
                <FieldCaption error={Boolean(columnTypeError)}>
                    {columnTypeError ?? "Optional database override for this string field."}
                </FieldCaption>
            </div>

            <div className={"col-span-12"}>
                <Select name={isIdPath}
                    disabled={disabled}
                    fullWidth={true}
                    value={isIdValue === true ? "true" : (isIdValue === false ? "false" : (isIdValue ?? "_default_"))}
                    onValueChange={(v) => {
                        if (v === "_default_" || v === "false") setFieldValue(isIdPath, undefined);
                        else if (v === "true") setFieldValue(isIdPath, true);
                        else setFieldValue(isIdPath, v);
                    }}
                    renderValue={(v) => {
                        switch (v) {
                            case "true": return "Yes (Auto-generated UUID/String)";
                            case "manual": return "Yes (Manual input)";
                            case "uuid": return "Yes (UUID)";
                            case "cuid": return "Yes (CUID)";
                            case "false":
                            case "_default_": return "No";
                            default: return `Yes (${v})`;
                        }
                    }}
                    error={Boolean(isIdError)}
                    label={"Primary Key / Unique ID"}>
                    <SelectItem value={"_default_"}> No </SelectItem>
                    <SelectItem value={"manual"}> Yes (Manual input) </SelectItem>
                    <SelectItem value={"true"}> Yes (Auto-generated UUID/String) </SelectItem>
                    <SelectItem value={"uuid"}> Yes (UUID) </SelectItem>
                    <SelectItem value={"cuid"}> Yes (CUID) </SelectItem>
                </Select>
                <FieldCaption error={Boolean(isIdError)}>
                    {isIdError ?? "Set as Primary Key and configure ID generation strategy."}
                </FieldCaption>
            </div>

            <div className={"col-span-12"}>

                <TextField name={"defaultValue"}
                    disabled={disabled}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                        setFieldValue("defaultValue", e.target.value === "" ? undefined : e.target.value);
                    }}
                    label={"Default value"}
                    value={getIn(values, "defaultValue") ?? ""} />

            </div>
        </>
    );
}
