import React from "react";
import { NumberPropertyValidation } from "./validation/NumberPropertyValidation";
import { ValidationPanel } from "./validation/ValidationPanel";
import { FieldCaption } from "@rebasepro/core";
import { Select, SelectItem, TextField } from "@rebasepro/ui";
import { getIn, useFormex } from "@rebasepro/formex";

export function NumberPropertyField({ disabled }: {
    disabled: boolean;
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
                    <NumberPropertyValidation disabled={disabled} />
                </ValidationPanel>

            </div>

            <div className={"col-span-12"}>
                <Select name={columnTypePath}
                    disabled={disabled || Boolean(isIdValue)}
                    fullWidth={true}
                    value={columnTypeValue ?? "_default_"}
                    onValueChange={(v) => setFieldValue(columnTypePath, v === "_default_" ? undefined : v)}
                    renderValue={(v) => {
                        switch (v) {
                            case "integer": return "integer";
                            case "real": return "real (float4)";
                            case "double precision": return "double precision (float8)";
                            case "numeric": return "numeric / decimal";
                            case "bigint": return "bigint";
                            case "serial": return "serial";
                            case "bigserial": return "bigserial";
                            case "_default_": return "Default (integer/numeric)";
                            default: return "Default (integer/numeric)";
                        }
                    }}
                    error={Boolean(columnTypeError)}
                    label={"Database Column Type"}>
                    <SelectItem value={"_default_"}> Default (integer/numeric) </SelectItem>
                    <SelectItem value={"integer"}> integer </SelectItem>
                    <SelectItem value={"real"}> real (float4) </SelectItem>
                    <SelectItem value={"double precision"}> double precision (float8) </SelectItem>
                    <SelectItem value={"numeric"}> numeric / decimal </SelectItem>
                    <SelectItem value={"bigint"}> bigint </SelectItem>
                    <SelectItem value={"serial"}> serial </SelectItem>
                    <SelectItem value={"bigserial"}> bigserial </SelectItem>
                </Select>
                <FieldCaption error={Boolean(columnTypeError)}>
                    {columnTypeError ?? "Optional database override for this number field."}
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
                            case "true": return "Yes (Auto-increment/identity)";
                            case "increment": return "Yes (Increment)";
                            case "manual": return "Yes (Manual input)";
                            case "false":
                            case "_default_": return "No";
                            default: return `Yes (${v})`;
                        }
                    }}
                    error={Boolean(isIdError)}
                    label={"Primary Key / Unique ID"}>
                    <SelectItem value={"_default_"}> No </SelectItem>
                    <SelectItem value={"manual"}> Yes (Manual input) </SelectItem>
                    <SelectItem value={"true"}> Yes (Auto-increment/identity) </SelectItem>
                    <SelectItem value={"increment"}> Yes (Increment) </SelectItem>
                </Select>
                <FieldCaption error={Boolean(isIdError)}>
                    {isIdError ?? "Set as Primary Key and configure ID generation strategy."}
                </FieldCaption>
            </div>

            <div className={"col-span-12"}>

                <TextField name={"defaultValue"}
                    disabled={disabled}
                    type={"number"}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                        setFieldValue("defaultValue", e.target.value === "" ? undefined : parseFloat(e.target.value));
                    }}
                    label={"Default value"}
                    value={getIn(values, "defaultValue") ?? ""} />

            </div>
        </>
    );
}
