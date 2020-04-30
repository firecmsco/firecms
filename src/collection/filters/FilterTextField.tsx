import { NumberProperty, StringProperty } from "../../models";
import { Field } from "formik";
import {
    FormControl,
    Grid,
    Input,
    MenuItem,
    Select as MuiSelect,
    Typography
} from "@material-ui/core";
import React, { useState } from "react";

interface TextFieldProps {
    name: string,
    property: StringProperty | NumberProperty,
}

export default function StringNumberFilterField({ name, property }: TextFieldProps) {

    const enumValues = property.enumValues;

    return (
        <Field
            name={`${name}`}
        >
            {({
                  field,
                  form: { setFieldValue },
                  ...props
              }: any) => {

                const [fieldOperation, fieldValue] = field.value ? field.value : ["==", undefined];
                const [operation, setOperation] = useState<string>(fieldOperation);
                const [value, setValue] = useState<string | number>(fieldValue);

                function updateFilter(op: string, val: string | number) {
                    setOperation(op);
                    setValue(value);
                    if (op && val) {
                        setFieldValue(
                            name,
                            [op, val]
                        );
                    } else {
                        setFieldValue(
                            name,
                            undefined
                        );
                    }
                }

                return (

                    <FormControl
                        fullWidth>
                        <Typography variant={"caption"}>
                            {property.title || name}
                        </Typography>
                        <Grid container>

                            <Grid item xs={3}>
                                <MuiSelect value={operation}
                                           autoWidth
                                           onChange={(evt: any) => {
                                               updateFilter(evt.target.value, value);
                                           }}>
                                    <MenuItem value={"=="}>==</MenuItem>
                                    <MenuItem value={">"}>{">"}</MenuItem>
                                    <MenuItem value={"<"}>{"<"}</MenuItem>
                                    <MenuItem value={">="}>{">="}</MenuItem>
                                    <MenuItem value={"<="}>{"<="}</MenuItem>
                                </MuiSelect>
                            </Grid>

                            {!enumValues && <Grid item xs={9}>
                                <Input
                                    key={`filter-${name}`}
                                    type={property.dataType === "number" ? "number" : undefined}
                                    defaultValue={value}
                                    onChange={(evt) => {
                                        updateFilter(operation, evt.target.value);
                                    }}
                                />
                            </Grid>}

                            {enumValues && <Grid item xs={9}>
                                <MuiSelect
                                    fullWidth
                                    key={`filter-${name}`}
                                    value={value}
                                    onChange={(evt: any) => {
                                        updateFilter(operation, evt.target.value);
                                    }}>
                                    {Object.entries(enumValues).map(([key, value]) => (
                                        <MenuItem key={`select-${key}`}
                                                  value={key}>{value as string}</MenuItem>
                                    ))}
                                </MuiSelect>
                            </Grid>}

                        </Grid>
                    </FormControl>
                );
            }}
        </Field>
    );

}
