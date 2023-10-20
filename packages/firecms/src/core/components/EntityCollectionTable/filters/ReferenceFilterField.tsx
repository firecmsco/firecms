import React, { useMemo, useState } from "react";
import { VirtualTableWhereFilterOp } from "../../VirtualTable";
import { Entity, EntityCollection, EntityReference } from "../../../../types";
import { ReferencePreview } from "../../../../preview";
import { getReferenceFrom } from "../../../util";
import { useNavigationContext, useReferenceDialog } from "../../../../hooks";
import { Button } from "../../../../components/Button";
import { Select, SelectItem } from "../../../../components";

interface ReferenceFilterFieldProps {
    name: string,
    value?: [op: VirtualTableWhereFilterOp, fieldValue: any];
    setValue: (filterValue?: [VirtualTableWhereFilterOp, any]) => void;
    isArray?: boolean;
    path?: string;
    title?: string;
    previewProperties?: string[];
    popupOpen: boolean;
    setPopupOpen: (open: boolean) => void;
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
                                         name,
                                         value,
                                         setValue,
                                         isArray,
                                         path,
                                         title,
                                         previewProperties,
                                         setPopupOpen
                                     }: ReferenceFilterFieldProps) {

    const possibleOperations: (keyof typeof operationLabels) [] = isArray
        ? ["array-contains"]
        : ["==", "!=", ">", "<", ">=", "<="];

    const [onHover, setOnHover] = React.useState(false);

    isArray
        ? possibleOperations.push("array-contains-any")
        : possibleOperations.push("in", "not-in");

    const [fieldOperation, fieldValue] = value || [possibleOperations[0], undefined];
    const [operation, setOperation] = useState<VirtualTableWhereFilterOp>(fieldOperation);
    const [internalValue, setInternalValue] = useState<EntityReference | EntityReference[] | undefined>(fieldValue);

    const selectedEntityIds = internalValue
        ? (Array.isArray(internalValue) ? internalValue.map((ref) => {
            if (!(ref instanceof EntityReference)) {
                return null;
            }
            return ref.id;
        }).filter(Boolean) as string[] : [internalValue.id])
        : [];

    function updateFilter(op: VirtualTableWhereFilterOp, val?: EntityReference | EntityReference[]) {

        const prevOpIsArray = multipleSelectOperations.includes(operation);
        const newOpIsArray = multipleSelectOperations.includes(op);
        let newValue = val;
        if (prevOpIsArray !== newOpIsArray) {
            // @ts-ignore
            newValue = newOpIsArray ? (newValue instanceof EntityReference ? [newValue] : []) : undefined
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

    const navigationContext = useNavigationContext();
    const collection: EntityCollection | undefined = useMemo(() => {
        return path ? navigationContext.getCollection(path) : undefined;
    }, [path]);

    const onSingleEntitySelected = (entity: Entity<any>) => {
        updateFilter(operation, getReferenceFrom(entity));
    };

    const onMultipleEntitiesSelected = (entities: Entity<any>[]) => {
        updateFilter(operation, entities.map(e => getReferenceFrom(e)));
    };

    const multiple = multipleSelectOperations.includes(operation);

    const referenceDialogController = useReferenceDialog({
            multiselect: multiple,
            path,
            collection,
            onSingleEntitySelected,
            onMultipleEntitiesSelected,
            selectedEntityIds,
            onClose: () => {
                setPopupOpen(true);
            }
        }
    );

    const doOpenDialog = () => {
        setPopupOpen(false);
        referenceDialogController.open();
    };

    const buildEntry = (reference: EntityReference) => {
        return (
            <div
                className="mb-0.5"
                onMouseEnter={() => setOnHover(true)}
                onMouseMove={() => setOnHover(true)}
                onMouseLeave={() => setOnHover(false)}>
                <ReferencePreview
                    disabled={!path}
                    previewProperties={previewProperties}
                    size={"medium"}
                    onClick={doOpenDialog}
                    reference={reference}
                    onHover={onHover}
                    allowEntityNavigation={false}
                />
            </div>
        );
    };

    return (

        <div className="flex w-[440px] flex-row">
            <div className="w-[120px]">
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

            <div className="flex-grow ml-2 h-full">

                {internalValue && Array.isArray(internalValue) && <div>
                    {internalValue.map((ref, index) => buildEntry(ref))}
                </div>}
                {internalValue && !Array.isArray(internalValue) && <div>
                    {buildEntry(internalValue)}
                </div>}
                {(!internalValue || (Array.isArray(internalValue) && internalValue.length === 0)) &&
                    <Button onClick={doOpenDialog}
                            className="h-full">
                        {multiple ? "Select references" : "Select reference"}
                    </Button>
                }
            </div>

        </div>
    );

}
