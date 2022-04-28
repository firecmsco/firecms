import React from "react";

import { FastField, getIn, useFormikContext } from "formik";
import { Grid } from "@mui/material";
import DebouncedTextField from "../../../form/components/DebouncedTextField";
import { SwitchControl } from "../../../form/components/SwitchControl";

export function GeneralPropertyValidation({disabled}: {
    required?: boolean;
    disabled:boolean;
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
                           disabled={disabled}
                           name={validationRequired}
                           label={"Required"}
                           tooltip={"You won't be able to save this entity if this value is not set"}
                           component={SwitchControl}/>
            </Grid>

            <Grid item xs={4}>
                <FastField type="checkbox"
                           disabled={disabled}
                           name={validationUnique}
                           label={"Unique"}
                           tooltip={"There cannot be multiple entities with the same value"}
                           component={SwitchControl}/>
            </Grid>

            {getIn(values, validationRequired) && <Grid item xs={12}>
                <DebouncedTextField
                    disabled={disabled}
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
