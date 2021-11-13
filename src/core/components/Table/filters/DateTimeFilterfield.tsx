import React, { useState } from "react";
import {
    Box,
    FormControl,
    IconButton,
    Input,
    MenuItem,
    Select as MuiSelect
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import Tooltip from "@mui/material/Tooltip/Tooltip";
import DateTimePicker from "@mui/lab/DateTimePicker";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { TableWhereFilterOp } from "../TableProps";

interface DateTimeFilterFieldProps {
    name: string,
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
    "in": "in",
    "array-contains": "Contains",
    "array-contains-any": "Any"
};

const multipleSelectOperations = ["array-contains-any", "in"];


export function DateTimeFilterField({
                                        name,
                                        isArray,
                                        value,
                                        setValue,
                                        title
                                    }: DateTimeFilterFieldProps) {

    const possibleOperations: (keyof typeof operationLabels) [] = isArray ?
        ["array-contains"] :
        ["==", "!=", ">", "<", ">=", "<="];

    const [fieldOperation, fieldValue] = value ? value : [possibleOperations[0], undefined];
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

    return (

        <Box display={"flex"} width={340} alignItems={"center"}>
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

                <DateTimePicker
                    clearable
                    InputProps={{
                        // disableUnderline: true,
                    }}
                    renderInput={(props) => (
                        <Input
                            startAdornment={
                                <CalendarTodayIcon fontSize={"small"}/>
                            }
                        />
                    )}
                    value={internalValue ?? null}
                    onChange={(dateValue: Date | null) => {
                        updateFilter(operation, dateValue === null ? undefined : dateValue);
                    }}
                />

            </Box>

            {internalValue !== undefined && <Box ml={1}>
                <IconButton
                    onClick={(e) => updateFilter(operation, undefined)}
                    size={"small"}>
                    <Tooltip title={`Clear ${title}`}>
                        <ClearIcon fontSize={"small"}/>
                    </Tooltip>
                </IconButton>
            </Box>}

        </Box>
    );

}
