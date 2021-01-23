import {
    ArrayProperty,
    NumberProperty,
    StringProperty
} from "../../models";
import { Field } from "formik";
import {
    Box,
    FormControl,
    IconButton,
    Input,
    MenuItem,
    Select as MuiSelect
} from "@material-ui/core";
import ClearIcon from "@material-ui/icons/Clear";
import React, { useState } from "react";
import { FieldProps } from "formik/dist/Field";
import Tooltip from "@material-ui/core/Tooltip/Tooltip";
import { CustomChip } from "../../preview/components/CustomChip";

interface StringNumberFilterFieldProps {
    name: string,
    property: ArrayProperty<string | number> | StringProperty | NumberProperty,
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

export default function StringNumberFilterField({ name, property }: StringNumberFilterFieldProps) {

    const isArray = property.dataType === "array";

    const dataType = property.dataType === "array" ? property.of.dataType : property.dataType;
    const enumValues = property.dataType === "array" ? property.of.config?.enumValues : property.config?.enumValues;
    const possibleOperations = isArray ?
        ["array-contains"] :
        ["==", "!=", ">", "<", ">=", "<="];

    if (enumValues)
        isArray ?
            possibleOperations.push("array-contains-any") :
            possibleOperations.push("in");

    return (
        <Field
            name={`${name}`}
        >
            {({
                  field,
                  form: { setFieldValue },
                  ...props
              }: FieldProps) => {

                const [fieldOperation, fieldValue] = field.value ? field.value : [possibleOperations[0], undefined];
                const [operation, setOperation] = useState<string>(fieldOperation);
                const [internalValue, setInternalValue] = useState<string | number | string[] | number[] | undefined>(fieldValue);

                function updateFilter(op: string, val: string | number | string[] | number[] | undefined) {
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

                    const hasNewValue = Array.isArray(newValue) ? newValue.length > 0 : newValue;
                    if (op && hasNewValue) {
                        setFieldValue(
                            name,
                            [op, newValue]
                        );
                    } else {
                        setFieldValue(
                            name,
                            undefined
                        );
                    }
                }

                const multiple = multipleSelectOperations.includes(operation);
                return (

                    <FormControl
                        fullWidth>
                        <Box display={"flex"} width={340} alignItems={"center"}>
                            <Box width={100}>
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
                            </Box>

                            <Box flexGrow={1} ml={1}>

                                {!enumValues && <Input
                                    fullWidth
                                    key={`filter_${name}`}
                                    type={dataType === "number" ? "number" : undefined}
                                    value={internalValue ? internalValue : ""}
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
                                    value={!!internalValue ? internalValue : isArray ? [] : ""}
                                    onChange={(evt: any) => updateFilter(operation, evt.target.value)}
                                    renderValue={multiple ? (selected: any) =>
                                        (
                                            <div>
                                                {selected.map((v: any) =>
                                                    <CustomChip
                                                        colorKey={ v as string}
                                                        label={enumValues[v] || v}
                                                        error={!enumValues[v]}
                                                        outlined={false}
                                                        small={true}/>)}
                                            </div>
                                        ) : undefined}>
                                    {Object.entries(enumValues).map(([key, value]) => (
                                        <MenuItem key={`select_${name}_${key}`}
                                                  value={key}>
                                            <CustomChip
                                                colorKey={key as string}
                                                label={value}
                                                error={!value}
                                                outlined={false}
                                                small={true}/>
                                        </MenuItem>
                                    ))}
                                </MuiSelect>}

                            </Box>

                            {internalValue && <Box ml={1}>
                                <IconButton
                                    onClick={(e) => updateFilter(operation, undefined)}
                                    size={"small"}>
                                    <Tooltip title={`Clear ${property.title}`}>
                                        <ClearIcon fontSize={"small"}/>
                                    </Tooltip>
                                </IconButton>
                            </Box>}

                        </Box>
                    </FormControl>
                );
            }}
        </Field>
    );

}
