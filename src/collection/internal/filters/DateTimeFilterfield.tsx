import React, { useState } from "react";
import {
    ArrayProperty,
    TimestampProperty,
    WhereFilterOp
} from "../../../models";
import {
    Box,
    FormControl,
    IconButton,
    MenuItem,
    Select as MuiSelect,
    Input
} from "@material-ui/core";
import ClearIcon from "@material-ui/icons/Clear";
import Tooltip from "@material-ui/core/Tooltip/Tooltip";
import DateTimePicker  from "@material-ui/lab/DateTimePicker";
import CalendarTodayIcon from "@material-ui/icons/CalendarToday";
import { useInputStyles } from "../fields/styles";

interface DateTimeFilterFieldProps {
    name: string,
    value?: [op: WhereFilterOp, fieldValue: any];
    setValue: (value?: [op: WhereFilterOp, newValue: any]) => void;
    property: ArrayProperty<Date[]> | TimestampProperty,
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


export default function DateTimeFilterField({
                                                name,
                                                property,
                                                value,
                                                setValue
                                            }: DateTimeFilterFieldProps) {


    const classes = useInputStyles();

    const isArray = property.dataType === "array";
    if (isArray && !(property as ArrayProperty).of) {
        throw Error(`You need to specify an 'of' prop (or specify a custom field) in your array property ${name}`);
    }
    const possibleOperations: (keyof typeof operationLabels) [] = isArray ?
        ["array-contains"] :
        ["==", "!=", ">", "<", ">=", "<="];

    const [fieldOperation, fieldValue] = value ? value : [possibleOperations[0], undefined];
    const [operation, setOperation] = useState<WhereFilterOp>(fieldOperation);
    const [internalValue, setInternalValue] = useState<Date | undefined>(fieldValue);

    function updateFilter(op: WhereFilterOp, val: Date | undefined) {
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
                    <Tooltip title={`Clear ${property.title}`}>
                        <ClearIcon fontSize={"small"}/>
                    </Tooltip>
                </IconButton>
            </Box>}

        </Box>
    );

}
