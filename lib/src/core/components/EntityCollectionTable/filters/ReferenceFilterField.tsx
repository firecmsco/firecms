import {
    Box,
    Button,
    FormControl,
    MenuItem,
    Select as MuiSelect
} from "@mui/material";
import React, { useMemo, useState } from "react";
import { TableWhereFilterOp } from "../../Table";
import { Entity, EntityCollection, EntityReference } from "../../../../types";
import { ReferencePreview } from "../../../../preview";
import { getReferenceFrom } from "../../../util";
import { useNavigationContext, useReferenceDialog } from "../../../../hooks";

interface ReferenceFilterFieldProps {
    name: string,
    value?: [op: TableWhereFilterOp, fieldValue: any];
    setValue: (filterValue?: [TableWhereFilterOp, any]) => void;
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
    const [operation, setOperation] = useState<TableWhereFilterOp>(fieldOperation);
    const [internalValue, setInternalValue] = useState<EntityReference | EntityReference[] | undefined>(fieldValue);

    const selectedEntityIds = internalValue
        ? (Array.isArray(internalValue) ? internalValue.map((ref) => ref.id) : [internalValue.id])
        : [];

    function updateFilter(op: TableWhereFilterOp, val?: EntityReference | EntityReference[]) {

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
            <Box
                sx={{ mb: 0.5 }}
                onMouseEnter={() => setOnHover(true)}
                onMouseMove={() => setOnHover(true)}
                onMouseLeave={() => setOnHover(false)}>
                <ReferencePreview
                    disabled={!path}
                    previewProperties={previewProperties}
                    size={"regular"}
                    onClick={doOpenDialog}
                    reference={reference}
                    onHover={onHover}
                    allowEntityNavigation={false}
                />
            </Box>
        );
    };

    return (

        <Box
            display={"flex"}
            width={440}
            flexDirection={"row"}>
            <Box width={120}>
                <FormControl fullWidth>
                    <MuiSelect value={operation}
                               fullWidth
                               onChange={(evt: any) => {
                                   updateFilter(evt.target.value, internalValue);
                               }}>
                        {possibleOperations.map((op) =>
                            <MenuItem
                                key={`filter_op_${name}_${op}`}
                                value={op}>{operationLabels[op]}</MenuItem>
                        )}

                    </MuiSelect>
                </FormControl>
            </Box>

            <Box flexGrow={1} ml={1}>

                <FormControl fullWidth
                             sx={{ height: "100%" }}>
                    {internalValue && Array.isArray(internalValue) && <Box>
                        {internalValue.map((ref, index) => buildEntry(ref))}
                    </Box>}
                    {internalValue && !Array.isArray(internalValue) && <Box>
                        {buildEntry(internalValue)}
                    </Box>}
                    {(!internalValue || (Array.isArray(internalValue) && internalValue.length === 0)) &&
                        <Button onClick={doOpenDialog}
                                sx={{ height: "100%" }}>
                            {multiple ? "Select references" : "Select reference"}
                        </Button>
                    }
                </FormControl>
            </Box>

        </Box>
    );

}
