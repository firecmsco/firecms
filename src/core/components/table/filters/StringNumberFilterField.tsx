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
import Tooltip from "@mui/material/Tooltip/Tooltip";
import { EnumValuesChip } from "../../../../preview/components/CustomChip";
import { TableEnumValues, TableWhereFilterOp } from "../TableProps";

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
    "in": "in",
    "array-contains": "Contains",
    "array-contains-any": "Any"
};

const multipleSelectOperations = ["array-contains-any", "in"];

export function StringNumberFilterField({
                                            name,
                                            value,
                                            setValue,
                                            dataType,
                                            isArray,
                                            enumValues,
                                            title
                                        }: StringNumberFilterFieldProps) {

    const possibleOperations: (keyof typeof operationLabels) [] = isArray ?
        ["array-contains"] :
        ["==", "!=", ">", "<", ">=", "<="];

    if (enumValues)
        isArray ?
            possibleOperations.push("array-contains-any") :
            possibleOperations.push("in");

    const [fieldOperation, fieldValue] = value ? value : [possibleOperations[0], undefined];
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

                <FormControl fullWidth>
                    {!enumValues && <OutlinedInput
                        fullWidth
                        key={`filter_${name}`}
                        type={dataType === "number" ? "number" : undefined}
                        value={internalValue !== undefined ? internalValue : ""}
                        onChange={(evt) => {
                            const val = dataType === "number" ?
                                parseFloat(evt.target.value)
                                : evt.target.value;
                            updateFilter(operation, val);
                        }}
                    />}

                    {enumValues &&
                    <MuiSelect
                        fullWidth
                        key={`filter-select-${multiple}-${name}`}
                        multiple={multiple}
                        value={internalValue !== undefined ? internalValue : isArray ? [] : ""}
                        onChange={(evt: any) => updateFilter(operation, dataType === "number" ? parseInt(evt.target.value) : evt.target.value)}
                        renderValue={multiple ? (selected: any) =>
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
                            ) : undefined}>
                        {Object.entries(enumValues).map(([enumKey, labelOrConfig]) => {
                            return (
                                <MenuItem
                                    key={`select_${name}_${enumKey}`}
                                    value={enumKey}>
                                    <EnumValuesChip
                                        enumKey={enumKey}
                                        enumValues={enumValues}
                                        small={true}/>
                                </MenuItem>
                            );
                        })}
                    </MuiSelect>}
                </FormControl>
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
