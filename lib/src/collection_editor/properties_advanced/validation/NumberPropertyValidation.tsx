import React from "react";

import { FastField, getIn, useFormikContext } from "formik";
import { Box, Grid } from "@mui/material";
import DebouncedTextField from "../../../form/components/DebouncedTextField";
import { SmallSwitch } from "../../../form/components/SmallSwitch";
import { GeneralPropertyValidation } from "./GeneralPropertyValidation";

export function NumberPropertyValidation() {

    const { values, handleChange } = useFormikContext();

    const validationMin = "validation.min";
    const validationMax = "validation.max";
    const validationLessThan = "validation.lessThan";
    const validationMoreThan = "validation.moreThan";
    const validationPositive = "validation.positive";
    const validationNegative = "validation.negative";
    const validationInteger = "validation.integer";

    return (
        <>
            <Box mb={3}>
                <GeneralPropertyValidation/>
            </Box>
            <Grid container spacing={2}>

                <Grid item container spacing={2}>

                    <Grid item xs={6}>
                        <DebouncedTextField value={getIn(values, validationMin)}
                                            label={"Min value"}
                                            name={validationMin}
                                            type="number"
                                            size="small"
                                            fullWidth
                                            onChange={handleChange}/>
                    </Grid>

                    <Grid item xs={6}>
                        <DebouncedTextField value={getIn(values, validationMax)}
                                            label={"Max value"}
                                            name={validationMax}
                                            type="number"
                                            size="small"
                                            fullWidth
                                            onChange={handleChange}/>
                    </Grid>

                </Grid>
                <Grid item container spacing={2}>

                    <Grid item xs={6}>
                        <DebouncedTextField
                            value={getIn(values, validationLessThan)}
                            label={"Less than"}
                            name={validationLessThan}
                            type="number"
                            size="small"
                            fullWidth
                            onChange={handleChange}/>
                    </Grid>

                    <Grid item xs={6}>
                        <DebouncedTextField
                            value={getIn(values, validationMoreThan)}
                            label={"More than"}
                            name={validationMoreThan}
                            type="number"
                            size="small"
                            fullWidth
                            onChange={handleChange}/>
                    </Grid>

                </Grid>
                <Grid item container spacing={2}>
                    <Grid item xs={4}>
                        <FastField type="checkbox"
                                   name={validationPositive}
                                   label={"Positive value"}
                                   component={SmallSwitch}/>
                    </Grid>
                    <Grid item xs={4}>
                        <FastField type="checkbox"
                                   name={validationNegative}
                                   label={"Negative value"}
                                   component={SmallSwitch}/>
                    </Grid>
                    <Grid item xs={4}>
                        <FastField type="checkbox"
                                   name={validationInteger}
                                   label={"Integer value"}
                                   component={SmallSwitch}/>
                    </Grid>
                </Grid>
            </Grid>
        </>
    );
}
