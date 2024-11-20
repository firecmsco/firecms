import React, { useState } from "react";
import { VirtualTableWhereFilterOp } from "../../VirtualTable";
import { Checkbox, DateTimeField, Label, Select, SelectItem } from "@firecms/ui";
import { useCustomizationController } from "../../../hooks";

interface DateTimeFilterFieldProps {
    name: string,
    mode?: "date" | "date_time",
    value?: [op: VirtualTableWhereFilterOp, fieldValue: any];
    setValue: (value?: [op: VirtualTableWhereFilterOp, newValue: any]) => void;
    isArray?: boolean;
    title?: string;
}

const operationLabels: Record<VirtualTableWhereFilterOp, string> = {
    "==": "==",
    "!=": "!=",
    ">": ">",
    "<": "<",
    ">=": ">=",
    "<=": "<=",
    "not-in": "not in",
    in: "in",
    "array-contains": "Contains",
    "array-contains-any": "Any"
};

const multipleSelectOperations = ["array-contains-any", "in"];

export function DateTimeFilterField({
                                        name,
                                        isArray,
                                        mode,
                                        value,
                                        setValue,
                                        title
                                    }: DateTimeFilterFieldProps) {

    const { locale } = useCustomizationController();
    const possibleOperations: (keyof typeof operationLabels) [] = isArray
        ? ["array-contains"]
        : ["==", "!=", ">", "<", ">=", "<="];

    const [fieldOperation, fieldValue] = value || [possibleOperations[0], undefined];
    const [operation, setOperation] = useState<VirtualTableWhereFilterOp>(fieldOperation);
    const [internalValue, setInternalValue] = useState<Date | null | undefined>(fieldValue);

    function updateFilter(op: VirtualTableWhereFilterOp, val: Date | undefined | null) {
        let newValue: Date | null | undefined = val;
        const prevOpIsArray = multipleSelectOperations.includes(operation);
        const newOpIsArray = multipleSelectOperations.includes(op);
        if (prevOpIsArray !== newOpIsArray) {
            // @ts-ignore
            newValue = newOpIsArray ? (val ? [val] : []) : "";
        }

        setOperation(op);
        setInternalValue(newValue === null ? undefined : newValue);

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

    return (

        <div className="flex w-[440px]">
            <div className="w-[80px]">
                <Select value={operation}
                        size={"large"}
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

                <DateTimeField
                    mode={mode}
                    size={"large"}
                    locale={locale}
                    value={internalValue ?? undefined}
                    onChange={(dateValue: Date | null) => {
                        updateFilter(operation, dateValue === null ? undefined : dateValue);
                    }}
                    clearable={true}
                />

                <Label
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
                </Label>

            </div>

        </div>
    );

}
