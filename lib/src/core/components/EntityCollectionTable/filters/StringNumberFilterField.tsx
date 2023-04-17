import {
    Box,
    FormControl,
    IconButton,
    MenuItem,
    OutlinedInput,
    Select as MuiSelect
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import React, { useState } from "react";
import { EnumValuesChip } from "../../../../preview";
import { TableEnumValues, TableWhereFilterOp } from "../../Table";

interface StringNumberFilterFieldProps {
    name: string,
    dataType: "string" | "number";
    value?: [op: TableWhereFilterOp, fieldValue: any];
    setValue: (value?: [op: TableWhereFilterOp, newValue: any]) => void;
    isArray?: boolean;
    enumValues?: TableEnumValues;
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
    const [operation, setOperation] = useState<TableWhereFilterOp>(fieldOperation);
    const [internalValue, setInternalValue] = useState<string | number | string[] | number[] | undefined>(fieldValue);

    function updateFilter(op: TableWhereFilterOp, val: string | number | string[] | number[] | undefined) {
        let newValue = val;
        const prevOpIsArray = multipleSelectOperations.includes(operation);
        const newOpIsArray = multipleSelectOperations.includes(op);
        if (prevOpIsArray !== newOpIsArray) {
            // @ts-ignore
            newValue = newOpIsArray ? (typeof val === "string" || typeof val === "number" ? [val] : []) : "";
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

                <FormControl fullWidth>
                    {!enumValues && <OutlinedInput
                        fullWidth
                        key={`filter_${name}`}
                        type={dataType === "number" ? "number" : undefined}
                        value={internalValue !== undefined ? internalValue : ""}
                        onChange={(evt) => {
                            const val = dataType === "number"
                                ? parseFloat(evt.target.value)
                                : evt.target.value;
                            updateFilter(operation, val);
                        }}
                        endAdornment={internalValue && <IconButton
                            sx={{
                                position: "absolute",
                                right: "12px",
                                top: "8px"
                            }}
                            onClick={(e) => updateFilter(operation, undefined)}>
                            <ClearIcon/>
                        </IconButton>}
                    />}

                    {enumValues &&
                        <MuiSelect
                            fullWidth
                            key={`filter-select-${multiple}-${name}`}
                            multiple={multiple}
                            value={internalValue !== undefined ? internalValue : isArray ? [] : ""}
                            onChange={(evt: any) => updateFilter(operation, dataType === "number" ? parseInt(evt.target.value) : evt.target.value)}
                            endAdornment={internalValue && <IconButton
                                sx={{
                                    position: "absolute",
                                    right: "12px",
                                    top: "8px"
                                }}
                                onClick={(e) => updateFilter(operation, undefined)}>
                                <ClearIcon/>
                            </IconButton>}
                            renderValue={multiple
                                ? (selected: any) =>
                                    (
                                        <div>
                                            {selected.map((enumKey: any) => {
                                                return <EnumValuesChip
                                                    key={`select_value_${name}_${enumKey}`}
                                                    enumKey={enumKey}
                                                    enumValues={enumValues}
                                                    small={true}/>;
                                            })}
                                        </div>
                                    )
                                : undefined}>
                            {enumValues.map((enumConfig) => {
                                return (
                                    <MenuItem
                                        key={`select_${name}_${enumConfig.id}`}
                                        value={enumConfig.id}>
                                        <EnumValuesChip
                                            enumKey={enumConfig.id}
                                            enumValues={enumValues}
                                            small={true}/>
                                    </MenuItem>
                                );
                            })}
                        </MuiSelect>}
                </FormControl>
            </Box>

        </Box>
    );

}
