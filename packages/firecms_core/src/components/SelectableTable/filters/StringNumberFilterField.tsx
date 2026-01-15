import React, { useState } from "react";
import { EnumValuesChip } from "../../../preview";
import { VirtualTableWhereFilterOp } from "../../VirtualTable";
import {
    CloseIcon,
    IconButton,
    MultiSelect,
    MultiSelectItem,
    Select,
    SelectItem,
    TextField
} from "@firecms/ui";
import { EnumValueConfig } from "@firecms/types";

interface StringNumberFilterFieldProps {
    name: string,
    type: "string" | "number";
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
    "array-contains-any": "Any",
    "is-null": "Is null"
};

const multipleSelectOperations = ["array-contains-any", "in", "not-in"];

export function StringNumberFilterField({
    name,
    value,
    setValue,
    type,
    isArray,
    enumValues,
    title
}: StringNumberFilterFieldProps) {

    const possibleOperations: (keyof typeof operationLabels)[] = isArray
        ? ["array-contains"]
        : ["==", "!=", ">", "<", ">=", "<=", "is-null"];

    if (enumValues)
        isArray
            ? possibleOperations.push("array-contains-any")
            : possibleOperations.push("in", "not-in");

    const [fieldOperation, fieldValue] = value || [possibleOperations[0], undefined];
    const [operation, setOperation] = useState<VirtualTableWhereFilterOp | "is-null">(fieldOperation === "==" && fieldValue === null ? "is-null" : fieldOperation);
    const [internalValue, setInternalValue] = useState<string | number | string[] | number[] | null | undefined>(fieldValue);

    const isNullOperation = operation === "is-null";

    function updateFilter(op: VirtualTableWhereFilterOp | "is-null", val: string | number | string[] | number[] | null | undefined) {
        // Handle "is null" operation
        if (op === "is-null") {
            setOperation(op);
            setInternalValue(null);
            setValue(["==", null]);
            return;
        }

        let newValue = val;
        const prevOpIsArray = multipleSelectOperations.includes(operation);
        const newOpIsArray = multipleSelectOperations.includes(op);
        if (prevOpIsArray !== newOpIsArray) {
            // @ts-ignore
            newValue = newOpIsArray ? (typeof val === "string" || typeof val === "number" ? [val] : []) : undefined;
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

        <div className="flex w-full">
            <div className={"w-[100px]"}>
                <Select value={operation}
                    size={"medium"}
                    fullWidth={true}
                    position={"item-aligned"}
                    onValueChange={(value) => {
                        updateFilter(value as VirtualTableWhereFilterOp | "is-null", internalValue);
                    }}
                    renderValue={(op) => operationLabels[op as keyof typeof operationLabels]}>
                    {possibleOperations.map((op) => (
                        <SelectItem key={op} value={op}>
                            {operationLabels[op]}
                        </SelectItem>
                    ))}
                </Select>
            </div>

            <div className="grow ml-2 flex flex-col gap-2">

                {!enumValues && <TextField
                    size={"medium"}
                    type={type === "number" ? "number" : undefined}
                    value={internalValue !== undefined && internalValue != null ? String(internalValue) : ""}
                    disabled={isNullOperation}
                    placeholder={isNullOperation ? "null" : undefined}
                    onChange={(evt) => {
                        const val = type === "number"
                            ? parseFloat(evt.target.value)
                            : evt.target.value;
                        updateFilter(operation, val);
                    }}
                    endAdornment={internalValue !== undefined && internalValue != null && <IconButton
                        onClick={(e) => updateFilter(operation, undefined)}>
                        <CloseIcon />
                    </IconButton>}
                />}

                {enumValues && !multiple &&
                    <Select
                        size={"medium"}
                        position={"item-aligned"}
                        fullWidth={true}
                        disabled={isNullOperation}
                        value={typeof internalValue === "string" ? internalValue : ""}
                        onValueChange={(value) => {
                            if (value !== "")
                                updateFilter(operation, type === "number" ? parseInt(value as string) : value as string)
                        }}
                        endAdornment={internalValue && <IconButton
                            onClick={(e) => updateFilter(operation, undefined)}>
                            <CloseIcon />
                        </IconButton>}
                        renderValue={(enumKey) => {
                            if (enumKey === null)
                                return "Filter for null values";
                            if (enumKey === undefined)
                                return null;

                            return <EnumValuesChip
                                key={`select_value_${name}_${enumKey}`}
                                enumKey={enumKey}
                                enumValues={enumValues}
                                size={"small"} />;
                        }}>
                        {enumValues.map((enumConfig) => (
                            <SelectItem key={`select_item_${name}_${enumConfig.id}`}
                                value={String(enumConfig.id)}>
                                <EnumValuesChip
                                    enumKey={String(enumConfig.id)}
                                    enumValues={enumValues}
                                    size={"small"} />
                            </SelectItem>
                        ))}
                    </Select>
                }

                {enumValues && multiple &&
                    <MultiSelect
                        size={"medium"}
                        position={"item-aligned"}
                        value={Array.isArray(internalValue) ? internalValue.map(e => String(e)) : []}
                        disabled={isNullOperation}
                        onValueChange={(value) => {
                            updateFilter(operation, type === "number" ? value.map(v => parseInt(v)) : value)
                        }}
                        multiple={multiple}
                        endAdornment={internalValue && <IconButton
                            className="absolute right-2 top-3"
                            onClick={(e) => updateFilter(operation, undefined)}>
                            <CloseIcon />
                        </IconButton>}
                    >
                        {enumValues.map((enumConfig) => (
                            <MultiSelectItem key={`select_value_${name}_${enumConfig.id}`}
                                value={String(enumConfig.id)}>
                                <EnumValuesChip
                                    enumKey={String(enumConfig.id)}
                                    enumValues={enumValues}
                                    size={"small"} />
                            </MultiSelectItem>
                        ))}
                    </MultiSelect>
                }

            </div>

        </div>
    );

}
