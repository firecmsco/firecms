import React from "react";

import { Field, getIn, useFormikContext } from "formik";
import { Box, Grid, TextField } from "@mui/material";
import { PropertyWithId } from "../PropertyEditView";
import DebouncedTextField from "../../form/components/DebouncedTextField";

export function BasePropertyField({
                                      showErrors,
                                      disabledId
                                  }: { showErrors: boolean, disabledId: boolean }) {

    const {
        values,
        setFieldValue,
        handleChange,
        touched,
        errors,
        dirty,
        isSubmitting,
        handleSubmit
    } = useFormikContext<PropertyWithId>();

    const name = "name";
    const titleError = showErrors && getIn(errors, name);

    const id = "id";
    const idError = showErrors && getIn(errors, id);

    return (
        <>

            <Grid item>
                <Field name={name}
                       as={DebouncedTextField}
                       validate={validateName}
                       label={"Property name"}
                       required
                       fullWidth
                       helperText={titleError}
                       error={Boolean(titleError)}/>
            </Grid>

            <Grid item>
                <Box sx={{ display: "flex", flexDirection: "row" }}>
                    <Field name={id}
                           as={TextField}
                           label={"ID"}
                           validate={validateId}
                           disabled={disabledId}
                           required
                           fullWidth
                           helperText={idError}
                           size="small"
                           error={Boolean(idError)}/>

                </Box>
            </Grid>

        </>
    );

}

const idRegEx = /^(?:[a-zA-Z]+_)*[a-zA-Z0-9]+$/;

function validateId(value: string) {

    let error;
    if (!value) {
        error = "You must specify an id for the property";
    }
    if (!value.match(idRegEx)) {
        error = "The id can only contain letters, numbers and underscores (_), and not start with a number";
    }
    return error;
}

function validateName(value: string) {
    let error;
    if (!value) {
        error = "You must specify a title for the property";
    }
    return error;
}
