import React from "react";

import { FastField, getIn, useFormikContext } from "formik";
import { Grid } from "@mui/material";
import DebouncedTextField from "../../../form/components/DebouncedTextField";
import { SmallSwitch } from "../../../form/components/SmallSwitch";

export function GeneralPropertyValidation({}: {
    required?: boolean;
}) {

    const { values, handleChange } = useFormikContext();

    const validationRequired = "validation.required";
    const validationRequiredMessage = "validation.requiredMessage";
    const validationUnique = "validation.unique";
    const validationUniqueInArray = "validation.uniqueInArray";

    return (

        <Grid container spacing={2}>
            <Grid item xs={4}>
                <FastField type="checkbox"
                           name={validationRequired}
                           label={"Required"}
                           component={SmallSwitch}/>
            </Grid>

            <Grid item xs={4}>
                <FastField type="checkbox"
                           name={validationUnique}
                           label={"Unique"}
                           component={SmallSwitch}/>
            </Grid>

            {getIn(values, validationRequired) && <Grid item xs={12}>
                <DebouncedTextField
                    value={getIn(values, validationRequiredMessage)}
                    label={"Required message"}
                    name={validationRequiredMessage}
                    size="small"
                    fullWidth
                    onChange={handleChange}/>
            </Grid>}
        </Grid>
    );
}
