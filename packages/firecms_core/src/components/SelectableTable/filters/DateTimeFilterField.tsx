import React, { useState } from "react";
import { VirtualTableWhereFilterOp } from "../../VirtualTable";
import { DateTimeField, Select, SelectItem } from "@firecms/ui";
import { useCustomizationController } from "../../../hooks";

interface DateTimeFilterFieldProps {
    name: string,
    mode?: "date" | "date_time",
    value?: [op: VirtualTableWhereFilterOp, fieldValue: any];
    setValue: (value?: [op: VirtualTableWhereFilterOp, newValue: any]) => void;
    isArray?: boolean;
    title?: string;
    timezone?: string;
}

const operationLabels: Record<VirtualTableWhereFilterOp | "is-null", string> = {
    "==": "==",
    "!=": "!=",
    ">": ">",
    "<": "<",
    ">=": ">=",
    "<=": "<=",
    "not-in": "not in",
    in: "in",
    "array-contains": "Contains",
    "array-contains-any": "Any",
    "is-null": "Is null"
};

const multipleSelectOperations = ["array-contains-any", "in"];

export function DateTimeFilterField({
    name,
    isArray,
    mode,
    value,
    setValue,
    title,
    timezone
}: DateTimeFilterFieldProps) {

    const { locale } = useCustomizationController();
    const possibleOperations: (keyof typeof operationLabels)[] = isArray
        ? ["array-contains"]
        : ["==", "!=", ">", "<", ">=", "<=", "is-null"];

    const [fieldOperation, fieldValue] = value || [possibleOperations[0], undefined];
    const [operation, setOperation] = useState<VirtualTableWhereFilterOp | "is-null">(fieldOperation === "==" && fieldValue === null ? "is-null" : fieldOperation);
    const [internalValue, setInternalValue] = useState<Date | null | undefined>(fieldValue);

    const isNullOperation = operation === "is-null";

    function updateFilter(op: VirtualTableWhereFilterOp | "is-null", val: Date | undefined | null) {
        // Handle "is null" operation
        if (op === "is-null") {
            setOperation(op);
            setInternalValue(null);
            setValue(["==", null]);
            return;
        }

        let newValue: Date | null | undefined = val;
        const prevOpIsArray = multipleSelectOperations.includes(operation);
        const newOpIsArray = multipleSelectOperations.includes(op);
        if (prevOpIsArray !== newOpIsArray) {
            // @ts-ignore
            newValue = newOpIsArray ? (val ? [val] : []) : "";
        }

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

    return (

        <div className="flex w-full">
            <div className="w-[100px]">
                <Select value={operation}
                    size={"medium"}
                    fullWidth={true}
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

                <DateTimeField
                    mode={mode}
                    size={"medium"}
                    locale={locale}
                    timezone={timezone}
                    disabled={isNullOperation}
                    value={isNullOperation ? undefined : (internalValue ?? undefined)}
                    onChange={(dateValue: Date | null) => {
                        updateFilter(operation, dateValue === null ? undefined : dateValue);
                    }}
                    clearable={true}
                />

            </div>

        </div>
    );

}
