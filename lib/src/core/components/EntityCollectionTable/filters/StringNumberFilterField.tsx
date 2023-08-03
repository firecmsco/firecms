import React, { useState } from "react";
import { EnumValuesChip } from "../../../../preview";
import { VirtualTableWhereFilterOp } from "../../VirtualTable";
import { IconButton, Select, SelectItem, TextField } from "../../../../components";
import { ClearIcon } from "../../../../icons";
import { EnumValueConfig } from "../../../../types";

interface StringNumberFilterFieldProps {
    name: string,
    dataType: "string" | "number";
    value?: [op: VirtualTableWhereFilterOp, fieldValue: any];
    setValue: (value?: [op: VirtualTableWhereFilterOp, newValue: any]) => void;
    isArray?: boolean;
    enumValues?: EnumValueConfig[];
    title?: string;
}

const operationLabels = {
    "==": "==",
    "!=": "!=",
    ">": ">",
    "<": "<",
    ">=": ">=",
    "<=": "<=",
    in: "In",
    "not-in": "Not in",
    "array-contains": "Contains",
    "array-contains-any": "Any"
};

const multipleSelectOperations = ["array-contains-any", "in", "not-in"];

export function StringNumberFilterField({
                                            name,
                                            value,
                                            setValue,
                                            dataType,
                                            isArray,
                                            enumValues,
                                            title
                                        }: StringNumberFilterFieldProps) {

    const possibleOperations: (keyof typeof operationLabels) [] = isArray
        ? ["array-contains"]
        : ["==", "!=", ">", "<", ">=", "<="];

    if (enumValues)
        isArray
            ? possibleOperations.push("array-contains-any")
            : possibleOperations.push("in", "not-in");

    const [fieldOperation, fieldValue] = value || [possibleOperations[0], undefined];
    const [operation, setOperation] = useState<VirtualTableWhereFilterOp>(fieldOperation);
    const [internalValue, setInternalValue] = useState<string | number | string[] | number[] | undefined>(fieldValue);

    function updateFilter(op: VirtualTableWhereFilterOp, val: string | number | string[] | number[] | undefined) {
        let newValue = val;
        const prevOpIsArray = multipleSelectOperations.includes(operation);
        const newOpIsArray = multipleSelectOperations.includes(op);
        if (prevOpIsArray !== newOpIsArray) {
            // @ts-ignore
            newValue = newOpIsArray ? (typeof val === "string" || typeof val === "number" ? [val] : []) : "";
        }

        if (typeof newValue === "number" && isNaN(newValue))
            newValue = undefined;

        setOperation(op);
        setInternalValue(newValue);

        const hasNewValue = newValue !== null && Array.isArray(newValue)
            ? newValue.length > 0
            : newValue !== undefined;
        if (op && hasNewValue) {
            setValue(
                [op, newValue]
            );
        } else {
            setValue(
                undefined
            );
        }
    }

    const multiple = multipleSelectOperations.includes(operation);
    return (

        <div className="flex w-[440px] items-center">
            <div className={"w-[80px]"}>
                <Select value={operation}
                        onValueChange={(value) => {
                            updateFilter(value as VirtualTableWhereFilterOp, internalValue);
                        }}
                        renderValue={(op) => operationLabels[op as VirtualTableWhereFilterOp]}>
                    {possibleOperations.map((op) => (
                        <SelectItem key={op} value={op}>
                            {operationLabels[op]}
                        </SelectItem>
                    ))}
                </Select>
            </div>

            <div className="flex-grow ml-4">

                {!enumValues && <TextField
                    type={dataType === "number" ? "number" : undefined}
                    value={internalValue !== undefined ? String(internalValue) : ""}
                    onChange={(evt) => {
                        const val = dataType === "number"
                            ? parseFloat(evt.target.value)
                            : evt.target.value;
                        updateFilter(operation, val);
                    }}
                    endAdornment={internalValue && <IconButton
                        className="absolute right-3 top-2"
                        onClick={(e) => updateFilter(operation, undefined)}>
                        <ClearIcon/>
                    </IconButton>}
                />}

                {enumValues &&

                    <Select
                        value={internalValue !== undefined
                            ? (Array.isArray(internalValue) ? internalValue.map(e => String(e)) : String(internalValue))
                            : isArray ? [] : ""}
                        onValueChange={(value) => {
                            updateFilter(operation, dataType === "number" ? parseInt(value as string) : value as string)
                        }}
                        multiple={multiple}
                        endAdornment={internalValue && <IconButton
                            className="absolute right-3 top-2"
                            onClick={(e) => updateFilter(operation, undefined)}>
                            <ClearIcon/>
                        </IconButton>}
                        renderValue={(enumKey) => <EnumValuesChip
                            key={`select_value_${name}_${enumKey}`}
                            enumKey={enumKey}
                            enumValues={enumValues}
                            size={"small"}/>}>
                        {enumValues.map((enumConfig) => (
                            <SelectItem key={`select_value_${name}_${enumConfig.id}`}
                                        value={String(enumConfig.id)}>
                                <EnumValuesChip
                                    enumKey={String(enumConfig.id)}
                                    enumValues={enumValues}
                                    size={"small"}/>
                            </SelectItem>
                        ))}
                    </Select>
                }

            </div>

        </div>
    );

}
