import React from "react";

import { FastField, getIn, useFormikContext } from "formik";
import { Box, Grid } from "@mui/material";
import DebouncedTextField from "../../../form/components/DebouncedTextField";
import { SmallSwitch } from "../../../form/components/SmallSwitch";
import { GeneralPropertyValidation } from "./GeneralPropertyValidation";

export function StringPropertyValidation({
                                             length,
                                             lowercase,
                                             matches,
                                             max,
                                             min,
                                             trim,
                                             uppercase
                                         }: {
    length?: boolean;
    min?: boolean;
    max?: boolean;
    trim?: boolean;
    matches?: boolean;
    lowercase?: boolean;
    uppercase?: boolean;
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
            <Box mb={3}>
                <GeneralPropertyValidation/>
            </Box>
            <Grid container spacing={2}>
                <Grid item container spacing={2}>
                    {lowercase && <Grid item xs={4}>
                        <FastField type="checkbox"
                                   name={validationLowercase}
                                   label={"Lowercase"}
                                   component={SmallSwitch}/>
                    </Grid>}
                    {uppercase && <Grid item xs={4}>
                        <FastField type="checkbox"
                                   name={validationUppercase}
                                   label={"Uppercase"}
                                   component={SmallSwitch}/>
                    </Grid>}
                    {trim && <Grid item xs={4}>
                        <FastField type="checkbox"
                                   name={validationTrim}
                                   label={"Trim"}
                                   component={SmallSwitch}/>
                    </Grid>}
                </Grid>

                <Grid item container spacing={2}>
                    {length && <Grid item xs={4}>
                        <DebouncedTextField
                            value={getIn(values, validationLength)}
                            label={"Exact length"}
                            name={validationLength}
                            type="number"
                            size="small"
                            fullWidth
                            onChange={handleChange}/>
                    </Grid>}

                    {min && <Grid item xs={4}>
                        <DebouncedTextField value={getIn(values, validationMin)}
                                            label={"Min length"}
                                            name={validationMin}
                                            type="number"
                                            size="small"
                                            fullWidth
                                            onChange={handleChange}/>
                    </Grid>}

                    {max && <Grid item xs={4}>
                        <DebouncedTextField value={getIn(values, validationMax)}
                                            label={"Max length"}
                                            name={validationMax}
                                            type="number"
                                            size="small"
                                            fullWidth
                                            onChange={handleChange}/>
                    </Grid>}

                </Grid>

                {matches && <Grid item xs={12}>
                    <DebouncedTextField
                        value={getIn(values, validationMatches)}
                        label={"Matches regex"}
                        name={validationMatches}
                        size="small"
                        fullWidth
                        onChange={handleChange}/>
                </Grid>}
            </Grid>
        </>
    );
}
