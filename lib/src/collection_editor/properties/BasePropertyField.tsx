import React from "react";

import { Field, getIn, useFormikContext } from "formik";
import { Box, Grid, TextField } from "@mui/material";
import { PropertyWithId } from "../PropertyEditView";
import DebouncedTextField from "../../form/components/DebouncedTextField";

export function BasePropertyField({
                                      showErrors,
                                      disabledId,
                                      existingPropertyIds
                                  }: {
    showErrors: boolean,
    disabledId: boolean,
    existingPropertyIds?: string[];
}) {

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
                       label={"Field name"}
                       required
                       fullWidth
                       helperText={titleError}
                       error={Boolean(titleError)}/>
            </Grid>

            <Grid item>
                <Field name={id}
                       as={TextField}
                       label={"ID"}
                       validate={(value:string) => validateId(value, existingPropertyIds)}
                       disabled={disabledId}
                       required
                       fullWidth
                       helperText={idError}
                       size="small"
                       error={Boolean(idError)}/>
            </Grid>

        </>
    );

}

const idRegEx = /^(?:[a-zA-Z]+_)*[a-zA-Z0-9]+$/;

function validateId(value: string, existingPropertyIds?: string[]) {

    let error;
    if (!value) {
        error = "You must specify an id for the field";
    }
    if (!value.match(idRegEx)) {
        error = "The id can only contain letters, numbers and underscores (_), and not start with a number";
    }
    if (existingPropertyIds && existingPropertyIds.includes(value)) {
        error = "There is another field with this ID already";
    }
    return error;
}

function validateName(value: string) {
    let error;
    if (!value) {
        error = "You must specify a title for the field";
    }
    return error;
}
