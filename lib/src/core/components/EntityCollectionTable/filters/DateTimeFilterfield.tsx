import React, { useState } from "react";
import {
    Box,
    FormControl,
    IconButton,
    MenuItem,
    Select as MuiSelect,
    TextField
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TableWhereFilterOp } from "../../Table";

interface DateTimeFilterFieldProps {
    name: string,
    mode?: "date" | "date_time",
    value?: [op: TableWhereFilterOp, fieldValue: any];
    setValue: (value?: [op: TableWhereFilterOp, newValue: any]) => void;
    isArray?: boolean;
    title?: string;
}

const operationLabels = {
    "==": "==",
    "!=": "!=",
    ">": ">",
    "<": "<",
    ">=": ">=",
    "<=": "<=",
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

    const possibleOperations: (keyof typeof operationLabels) [] = isArray
        ? ["array-contains"]
        : ["==", "!=", ">", "<", ">=", "<="];

    const [fieldOperation, fieldValue] = value || [possibleOperations[0], undefined];
    const [operation, setOperation] = useState<TableWhereFilterOp>(fieldOperation);
    const [internalValue, setInternalValue] = useState<Date | undefined>(fieldValue);

    function updateFilter(op: TableWhereFilterOp, val: Date | undefined) {
        let newValue: Date | undefined = val;
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

    const PickerComponent = mode === undefined || mode === "date_time"
        ? DateTimePicker
        : DatePicker;

    return (

        <Box display={"flex"} width={440} alignItems={"center"}>
            <Box width={80}>
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
                <PickerComponent
                    value={internalValue ?? null}
                    renderInput={(params) =>
                        (
                            <TextField {...params}
                                   fullWidth
                                   sx={{
                                       minHeight: "56px"
                                   }}
                                   InputProps={{
                                       ...params.InputProps,
                                       sx: {
                                           minHeight: "56px"
                                       },
                                       endAdornment: <Box
                                           sx={{
                                               pr: 2,
                                               gap: 2
                                           }}>
                                           <IconButton
                                               sx={{
                                                   position: "absolute",
                                                   right: "56px",
                                                   top: "12px"
                                               }}
                                               onClick={(e) => updateFilter(operation, undefined)}>
                                               <ClearIcon/>
                                           </IconButton>
                                           {params.InputProps?.endAdornment}
                                       </Box>
                                   }}
                                   variant={"outlined"}/>
                        )}
                    onChange={(dateValue: Date | null) => {
                        updateFilter(operation, dateValue === null ? undefined : dateValue);
                    }}
                />

            </Box>

        </Box>
    );

}
