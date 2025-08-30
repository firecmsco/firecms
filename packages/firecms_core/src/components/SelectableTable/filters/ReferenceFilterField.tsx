import React, { useMemo, useState } from "react";
import { VirtualTableWhereFilterOp } from "../../VirtualTable";
import { Entity, EntityCollection, EntityReference } from "@firecms/types";
import { ReferencePreview } from "../../../preview";
import { useNavigationController, useEntitySelectionTable } from "../../../hooks";
import { Button, Checkbox, Label, Select, SelectItem } from "@firecms/ui";
import { getReferenceFrom } from "@firecms/util";

interface ReferenceFilterFieldProps {
    name: string,
    value?: [op: VirtualTableWhereFilterOp, fieldValue: any];
    setValue: (filterValue?: [VirtualTableWhereFilterOp, any]) => void;
    isArray?: boolean;
    path?: string;
    title?: string;
    includeId?: boolean;
    previewProperties?: string[];
    hidden: boolean;
    setHidden: (hidden: boolean) => void;
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

export function ReferenceFilterField({
                                         value,
                                         setValue,
                                         isArray,
                                         path,
                                         includeId = true,
                                         previewProperties,
                                         setHidden
                                     }: ReferenceFilterFieldProps) {

    const possibleOperations: (keyof typeof operationLabels) [] = isArray
        ? ["array-contains"]
        : ["==", "!=", ">", "<", ">=", "<="];

    if (isArray) {
        possibleOperations.push("array-contains-any");
    } else {
        possibleOperations.push("in", "not-in");
    }

    const [fieldOperation, fieldValue] = value || [possibleOperations[0], undefined];
    const [operation, setOperation] = useState<VirtualTableWhereFilterOp>(fieldOperation);
    const [internalValue, setInternalValue] = useState<EntityReference | EntityReference[] | undefined | null>(fieldValue);

    const selectedEntityIds = internalValue
        ? (Array.isArray(internalValue) ? internalValue.map((ref) => {
            if (!(ref?.isEntityReference && ref?.isEntityReference())) {
                return null;
            }
            return ref.id;
        }).filter(Boolean) as string[] : [internalValue.id])
        : [];

    function updateFilter(op: VirtualTableWhereFilterOp, val?: EntityReference | EntityReference[] | null) {

        const prevOpIsArray = multipleSelectOperations.includes(operation);
        const newOpIsArray = multipleSelectOperations.includes(op);
        let newValue = val;
        if (prevOpIsArray !== newOpIsArray) {
            // @ts-ignore
            newValue = newOpIsArray ? (newValue?.isEntityReference && newValue?.isEntityReference() ? [newValue] : []) : undefined
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

    const navigationController = useNavigationController();
    const collection: EntityCollection | undefined = useMemo(() => {
        return path ? navigationController.getCollection(path) : undefined;
    }, [path]);

    const onSingleEntitySelected = (entity: Entity<any>) => {
        updateFilter(operation, getReferenceFrom(entity));
    };

    const onMultipleEntitiesSelected = (entities: Entity<any>[]) => {
        updateFilter(operation, entities.map(e => getReferenceFrom(e)));
    };

    const multiple = multipleSelectOperations.includes(operation);

    const referenceDialogController = useEntitySelectionTable({
            multiselect: multiple,
            path,
            collection,
            onSingleEntitySelected,
            onMultipleEntitiesSelected,
            selectedEntityIds,
            onClose: () => {
                setHidden(false);
            }
        }
    );

    const doOpenDialog = () => {
        setHidden(true);
        referenceDialogController.open();
    };

    const buildEntry = (reference: EntityReference) => {
        return (
            <ReferencePreview
                disabled={!path}
                previewProperties={previewProperties}
                size={"medium"}
                onClick={doOpenDialog}
                reference={reference}
                hover={true}
                includeId={includeId}
                includeEntityLink={false}
            />
        );
    };

    return (

        <div className="flex w-[480px] flex-row">
            <div className="w-[140px]">
                <Select value={operation}
                        size={"large"}
                        fullWidth={true}
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

            <div className="grow ml-2 h-full gap-2 flex flex-col w-[340px]">

                {internalValue && Array.isArray(internalValue) && <div>
                    {internalValue.map((ref, index) => buildEntry(ref))}
                </div>}

                {internalValue && !Array.isArray(internalValue) && <div>
                    {buildEntry(internalValue)}
                </div>}

                {(!internalValue || (Array.isArray(internalValue) && internalValue.length === 0)) &&
                    <Button onClick={doOpenDialog}
                            variant={"outlined"}
                            size={"large"}
                            className="h-full w-full">
                        {multiple ? "Select references" : "Select reference"}
                    </Button>
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
