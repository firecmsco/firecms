import React from "react";

import { Field, FieldProps, getIn, useFormikContext } from "formik";
import {
    FormControlLabel,
    Grid,
    Paper,
    Switch,
    TextField,
    Typography
} from "@mui/material";

function ValidationSwitch({
                              field,
                              form,
                              label
                          }: FieldProps & { label: string }) {
    return <FormControlLabel
        checked={field.value ?? false}
        sx={{ ml: 0 }}
        control={
            <Switch size="small"
                    onChange={(e, checked) => form.setFieldValue(field.name, checked)}/>
        }
        label={<Typography variant={"body2"}>{label}</Typography>}
    />
}

// Regex for validating a regex
const regexRegex = /\/((?![*+?])(?:[^\r\n[/\\]|\\.|\[(?:[^\r\n\]\\]|\\.)*\])+)\/((?:g(?:im?|mi?)?|i(?:gm?|mg?)?|m(?:gi?|ig?)?)?)/;

export function StringPropertyField({
                                        widgetId
                                    }: {
    widgetId: "text_field" | "multiline" | "markdown" | "url" | "email";
}) {

    const { values, handleChange, errors, touched } = useFormikContext();

    const validationLength = "validation.length";
    const validationMin = "validation.min";
    const validationMax = "validation.max";
    const validationTrim = "validation.trim";
    const validationMatches = "validation.matches";
    const validationLowercase = "validation.lowercase";
    const validationUppercase = "validation.uppercase";

    return (
        <>
            <Typography variant={"subtitle2"} sx={{ mt: 1 }}>
                Validation
            </Typography>
            <Paper variant={"outlined"} sx={{ p: 2, mt: 1 }}>
                <Grid container spacing={2}>
                    <Grid item xs={4}>
                        <TextField value={getIn(values, validationLength)}
                                   label={"Exact length"}
                                   name={validationLength}
                                   type="number"
                                   size="small"
                                   fullWidth
                                   onChange={handleChange}/>
                    </Grid>
                    <Grid item xs={4}>
                        <TextField value={getIn(values, validationMin)}
                                   label={"Min length"}
                                   name={validationMin}
                                   type="number"
                                   size="small"
                                   fullWidth
                                   onChange={handleChange}/>
                    </Grid>
                    <Grid item xs={4}>
                        <TextField value={getIn(values, validationMax)}
                                   label={"Max length"}
                                   name={validationMax}
                                   type="number"
                                   size="small"
                                   fullWidth
                                   onChange={handleChange}/>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField value={getIn(values, validationMatches)}
                                   label={"Matches regex"}
                                   name={validationMatches}
                                   size="small"
                                   fullWidth
                                   onChange={handleChange}/>
                    </Grid>
                    <Grid item xs={4}>
                        <Field type="checkbox"
                               name={validationLowercase}
                               label={"Lowercase"}
                               component={ValidationSwitch}>
                        </Field>
                    </Grid>
                    <Grid item xs={4}>
                        <Field type="checkbox"
                               name={validationUppercase}
                               label={"Uppercase"}
                               component={ValidationSwitch}>
                        </Field>
                    </Grid>
                    <Grid item xs={4}>
                        <Field type="checkbox"
                               name={validationTrim}
                               label={"Trim"}
                               component={ValidationSwitch}>
                        </Field>
                    </Grid>
                </Grid>
            </Paper>
        </>
    );
}
