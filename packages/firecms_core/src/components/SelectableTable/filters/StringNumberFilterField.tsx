import React, { useState } from "react";
import { EnumValuesChip } from "../../../preview";
import { VirtualTableWhereFilterOp } from "../../VirtualTable";
import {
    Checkbox,
    ClearIcon,
    IconButton,
    Label,
    MultiSelect,
    MultiSelectItem,
    Select,
    SelectItem,
    TextField
} from "@firecms/ui";
import { EnumValueConfig } from "../../../types";

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
    const [internalValue, setInternalValue] = useState<string | number | string[] | number[] | null | undefined>(fieldValue);

    function updateFilter(op: VirtualTableWhereFilterOp, val: string | number | string[] | number[] | null | undefined) {
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

        <div className="flex w-[440px]">
            <div className={"w-[80px]"}>
                <Select value={operation}
                        fullWidth={true}
                        position={"item-aligned"}
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

            <div className="flex-grow ml-2 flex flex-col gap-2">

                {!enumValues && <TextField
                    type={dataType === "number" ? "number" : undefined}
                    value={internalValue !== undefined && internalValue != null ? String(internalValue) : ""}
                    onChange={(evt) => {
                        const val = dataType === "number"
                            ? parseFloat(evt.target.value)
                            : evt.target.value;
                        updateFilter(operation, val);
                    }}
                    endAdornment={internalValue && <IconButton
                        onClick={(e) => updateFilter(operation, undefined)}>
                        <ClearIcon/>
                    </IconButton>}
                />}

                {enumValues && !multiple &&
                    <Select
                        position={"item-aligned"}
                        fullWidth={true}
                        value={typeof internalValue === "string" ? internalValue : ""}
                        onValueChange={(value) => {
                            if (value !== "")
                                updateFilter(operation, dataType === "number" ? parseInt(value as string) : value as string)
                        }}
                        endAdornment={internalValue && <IconButton
                            className="absolute right-2 top-3"
                            onClick={(e) => updateFilter(operation, undefined)}>
                            <ClearIcon/>
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
                                size={"small"}/>;
                        }}>
                        {enumValues.map((enumConfig) => (
                            <SelectItem key={`select_item_${name}_${enumConfig.id}`}
                                        value={String(enumConfig.id)}>
                                <EnumValuesChip
                                    enumKey={String(enumConfig.id)}
                                    enumValues={enumValues}
                                    size={"small"}/>
                            </SelectItem>
                        ))}
                    </Select>
                }

                {enumValues && multiple &&
                    <MultiSelect
                        position={"item-aligned"}
                        value={Array.isArray(internalValue) ? internalValue.map(e => String(e)) : []}
                        onValueChange={(value) => {
                            updateFilter(operation, dataType === "number" ? value.map(v => parseInt(v)) : value)
                        }}
                        multiple={multiple}
                        endAdornment={internalValue && <IconButton
                            className="absolute right-2 top-3"
                            onClick={(e) => updateFilter(operation, undefined)}>
                            <ClearIcon/>
                        </IconButton>}
                        // renderValues={(enumKeys) => {
                        //     console.log("renderValues", enumKeys);
                        //     if (enumKeys === null)
                        //         return "Filter for null values";
                        //
                        //     return enumKeys.map(key => <EnumValuesChip
                        //         key={`select_value_${name}_${enumKeys}`}
                        //         enumKey={key}
                        //         enumValues={enumValues}
                        //         size={"small"}/>);
                        // }}
                    >
                        {enumValues.map((enumConfig) => (
                            <MultiSelectItem key={`select_value_${name}_${enumConfig.id}`}
                                             value={String(enumConfig.id)}>
                                <EnumValuesChip
                                    enumKey={String(enumConfig.id)}
                                    enumValues={enumValues}
                                    size={"small"}/>
                            </MultiSelectItem>
                        ))}
                    </MultiSelect>
                }

                {!isArray && <Label
                    className="border cursor-pointer rounded-md p-2 flex items-center gap-2 [&:has(:checked)]:bg-surface-100 dark:[&:has(:checked)]:bg-surface-800"
                    htmlFor="null-filter"
                >
                    <Checkbox id="null-filter"
                              checked={internalValue === null}
                              size={"small"}
                              onCheckedChange={(checked) => {
                                  if (internalValue !== null)
                                      updateFilter(operation, null);
                                  else updateFilter(operation, undefined);
                              }}/>
                    Filter for null values
                </Label>}

            </div>

        </div>
    );

}
