import React from "react";

import { FastField, getIn, useFormikContext } from "formik";
import { Grid, Paper, TextField, Typography } from "@mui/material";
import { SmallSwitch } from "../custom_form_fields/SmallSwitch";
import DebouncedTextField from "../custom_form_fields/DebouncedTextField";

export function StringPropertyField({
                                        widgetId
                                    }: {
    widgetId: "text_field" | "multiline" | "markdown" | "url" | "email";
}) {

    const { values, handleChange } = useFormikContext();

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
                        <DebouncedTextField value={getIn(values, validationLength)}
                                   label={"Exact length"}
                                   name={validationLength}
                                   type="number"
                                   size="small"
                                   fullWidth
                                   onChange={handleChange}/>
                    </Grid>
                    <Grid item xs={4}>
                        <DebouncedTextField value={getIn(values, validationMin)}
                                   label={"Min length"}
                                   name={validationMin}
                                   type="number"
                                   size="small"
                                   fullWidth
                                   onChange={handleChange}/>
                    </Grid>
                    <Grid item xs={4}>
                        <DebouncedTextField value={getIn(values, validationMax)}
                                   label={"Max length"}
                                   name={validationMax}
                                   type="number"
                                   size="small"
                                   fullWidth
                                   onChange={handleChange}/>
                    </Grid>
                    <Grid item xs={12}>
                        <DebouncedTextField value={getIn(values, validationMatches)}
                                   label={"Matches regex"}
                                   name={validationMatches}
                                   size="small"
                                   fullWidth
                                   onChange={handleChange}/>
                    </Grid>
                    <Grid item xs={4}>
                        <FastField type="checkbox"
                                   name={validationLowercase}
                                   label={"Lowercase"}
                                   component={SmallSwitch}/>
                    </Grid>
                    <Grid item xs={4}>
                        <FastField type="checkbox"
                                   name={validationUppercase}
                                   label={"Uppercase"}
                                   component={SmallSwitch}/>
                    </Grid>
                    <Grid item xs={4}>
                        <FastField type="checkbox"
                                   name={validationTrim}
                                   label={"Trim"}
                                   component={SmallSwitch}/>
                    </Grid>
                </Grid>
            </Paper>
        </>
    );
}
