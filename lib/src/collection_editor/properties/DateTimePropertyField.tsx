import React from "react";
import { Field, getIn, useFormikContext } from "formik";
import {
    FormControl,
    FormHelperText,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Typography
} from "@mui/material";

import { NumberProperty, StringProperty } from "../../models";
import { ExpandablePanel } from "../../core/components/ExpandablePanel";
import {
    GeneralPropertyValidation
} from "./validation/GeneralPropertyValidation";

export function DateTimePropertyField() {

    const {
        values,
        handleChange,
        errors,
        touched,
        setFieldError,
        setFieldValue
    } = useFormikContext<StringProperty | NumberProperty>();

    const modePath = "mode";
    const modeValue: string | undefined = getIn(values, modePath);
    const modeError: string | undefined = getIn(touched, modePath) && getIn(errors, modePath);

    const autoValuePath = "autoValue";
    const autoValueValue: string | undefined = getIn(values, autoValuePath);
    const autoValueError: string | undefined = getIn(touched, autoValuePath) && getIn(errors, autoValuePath);

    return (
        <>
            <Grid item>
                <FormControl fullWidth>
                    <InputLabel id="mode-label">Mode</InputLabel>
                    <Field name={modePath}
                           type="select"
                           value={modeValue}
                           error={modeError}
                           labelId="mode-label"
                           label={"Mode"}
                           as={Select}>
                        <MenuItem value={"date_time"}> Date/Time </MenuItem>
                        <MenuItem value={"date"}> Date </MenuItem>
                    </Field>
                    {modeError && <FormHelperText>{modeError}</FormHelperText>}
                </FormControl>
            </Grid>
            <Grid item>
                <FormControl fullWidth>
                    <InputLabel id="auto-value-label">Automatic
                        value</InputLabel>
                    <Field name={autoValuePath}
                           type="select"
                           value={autoValueValue ?? ""}
                           error={autoValueError}
                           labelId="auto-value-label"
                           label={"Automatic value"}
                           as={Select}>
                        <MenuItem value={""}> None </MenuItem>
                        <MenuItem value={"on_create"}> On create </MenuItem>
                        <MenuItem value={"on_update"}> On any update </MenuItem>
                    </Field>
                    <FormHelperText>{autoValueError ?? "Update this field automatically when creating or updating the entity"}</FormHelperText>
                </FormControl>
            </Grid>

            <Grid item xs={12}>

                <ExpandablePanel title={
                    <Typography variant={"button"}>
                        Validation
                    </Typography>}>
                    <Grid container spacing={2}>
                        <GeneralPropertyValidation/>
                    </Grid>
                </ExpandablePanel>

            </Grid>
        </>
    );
}

function validatePath(value: string) {
    let error;
    if (!value) {
        error = "You must specify a target collection for the field";
    }
    return error;
}
