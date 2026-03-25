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

    return (
        <>

            <div className={"col-span-12"}>

                <ValidationPanel>
                    <NumberPropertyValidation disabled={disabled} />
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

                <TextField name={"defaultValue"}
                    disabled={disabled}
                    type={"number"}
                    onChange={(e: any) => {
                        setFieldValue("defaultValue", e.target.value === "" ? undefined : parseFloat(e.target.value));
                    }}
                    label={"Default value"}
                    value={getIn(values, "defaultValue") ?? ""} />

            </div>
        </>
    );
}
