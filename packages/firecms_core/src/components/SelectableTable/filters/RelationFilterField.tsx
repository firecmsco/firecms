import React, { useMemo, useState } from "react";
import { VirtualTableWhereFilterOp } from "../../VirtualTable";
import { EntityRelation, Relation } from "@firecms/types";
import { Checkbox, Label, Select, SelectItem } from "@firecms/ui";
import { RelationSelector } from "../../RelationSelector";

interface RelationFilterFieldProps {
    name: string,
    value?: [VirtualTableWhereFilterOp, EntityRelation | EntityRelation[] | null];
    setValue: (value?: [VirtualTableWhereFilterOp, EntityRelation | EntityRelation[] | null]) => void;
    relation: Relation; // relation config provided externally
    hidden: boolean;
    setHidden: (value: boolean) => void;
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
    "array-contains-any": "Contains Any"
};

const multipleSelectOperations = ["array-contains-any", "in", "not-in"];

export function RelationFilterField({
                                        value,
                                        setValue,
                                        relation,
                                        name: _name,
                                        hidden: _hidden,
                                        setHidden: _setHidden,
                                    }: RelationFilterFieldProps) {

    const manyRelation = relation.cardinality === "many";

    const possibleOperations: (keyof typeof operationLabels) [] = manyRelation
        ? ["array-contains"]
        : ["==", "!=", ">", "<", ">=", "<="];

    if (manyRelation) {
        possibleOperations.push("array-contains-any");
    } else {
        possibleOperations.push("in", "not-in");
    }

    const [fieldOperation, fieldValue] = value || [possibleOperations[0], undefined];
    const [operation, setOperation] = useState<VirtualTableWhereFilterOp>(fieldOperation);
    const [internalValue, setInternalValue] = useState<EntityRelation | EntityRelation[] | undefined | null>(fieldValue);

    function updateFilter(op: VirtualTableWhereFilterOp, val?: EntityRelation | EntityRelation[] | null) {

        const prevOpIsArray = multipleSelectOperations.includes(operation);
        const newOpIsArray = multipleSelectOperations.includes(op);
        let newValue = val;
        if (prevOpIsArray !== newOpIsArray) {
            newValue = newOpIsArray ? (newValue instanceof EntityRelation ? [newValue] : []) : undefined;
        }

        setOperation(op);
        setInternalValue(newValue);

        const hasNewValue = newValue !== null && Array.isArray(newValue)
            ? newValue.length > 0
            : newValue !== undefined;
        if (op && hasNewValue) {
            setValue([op, newValue ?? null]);
        } else {
            setValue(undefined);
        }
    }

    const multiple = multipleSelectOperations.includes(operation);

    const relationSelectorValue = useMemo(() => {
        if (internalValue === null || internalValue === undefined) return undefined;
        if (Array.isArray(internalValue)) return internalValue.map(ref => new EntityRelation(ref.id, ref.path));
        return new EntityRelation(internalValue.id, internalValue.path);
    }, [internalValue]);

    const handleRelationSelectorChange = (newVal?: EntityRelation | EntityRelation[] | null) => {
        if (newVal === null) {
            updateFilter(operation, null);
            return;
        }
        if (newVal === undefined) {
            updateFilter(operation, undefined);
            return;
        }
        updateFilter(operation, newVal);
    };

    return (
        <div className="flex flex-row">
            <div className="">
                <Select
                    value={operation}
                    size={"large"}
                    fullWidth={true}
                    onValueChange={(newOp) => {
                        updateFilter(newOp as VirtualTableWhereFilterOp, internalValue);
                    }}
                    renderValue={(op) => operationLabels[op as VirtualTableWhereFilterOp]}
                >
                    {possibleOperations.map((op) => (
                        <SelectItem key={op} value={op}>
                            {operationLabels[op]}
                        </SelectItem>
                    ))}
                </Select>
            </div>

            <div className="grow ml-2 h-full gap-2 flex flex-col w-[340px]">
                <RelationSelector
                    relation={relation}
                    value={relationSelectorValue}
                    multiple={multiple}
                    onValueChange={handleRelationSelectorChange}
                    disabled={internalValue === null}
                    size={"medium"}
                />

                {!manyRelation && <Label
                    className="border cursor-pointer rounded-md p-2 flex items-center gap-2 [&:has(:checked)]:bg-surface-100 dark:[&:has(:checked)]:bg-surface-800"
                    htmlFor="null-filter"
                >
                    <Checkbox
                        id="null-filter"
                        checked={internalValue === null}
                        size={"small"}
                        onCheckedChange={() => {
                            if (internalValue !== null) updateFilter(operation, null);
                            else updateFilter(operation, undefined);
                        }}
                    />
                    Filter for null values
                </Label>}
            </div>
        </div>
    );
}
