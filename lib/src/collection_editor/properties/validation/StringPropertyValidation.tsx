import React from "react";

import { FastField, getIn, useFormikContext } from "formik";
import { Box, Grid } from "@mui/material";
import DebouncedTextField from "../../../form/components/DebouncedTextField";
import { SwitchControl } from "../../../form/components/SwitchControl";
import { GeneralPropertyValidation } from "./GeneralPropertyValidation";
import { isValidRegExp, serializeRegExp } from "../../../core/util/regexp";

export function StringPropertyValidation({
                                             length,
                                             lowercase,
                                             matches,
                                             max,
                                             min,
                                             trim,
                                             uppercase,
                                             disabled,
                                             showErrors
                                         }: {
    length?: boolean;
    min?: boolean;
    max?: boolean;
    trim?: boolean;
    matches?: boolean;
    lowercase?: boolean;
    uppercase?: boolean;
    disabled: boolean;
    showErrors: boolean;
}) {

    const { values, handleChange, errors } = useFormikContext();

    const validationLength = "validation.length";
    const validationMin = "validation.min";
    const validationMax = "validation.max";
    const validationTrim = "validation.trim";
    const validationMatches = "validation.matches";
    const validationLowercase = "validation.lowercase";
    const validationUppercase = "validation.uppercase";

    const matchesError = getIn(errors, validationMatches);

    const matchesValue = getIn(values, validationMatches);
    const matchesStringValue = typeof matchesValue === "string" ? matchesValue : serializeRegExp(matchesValue);
    return (
        <>
            <Box mb={3}>
                <GeneralPropertyValidation disabled={disabled}/>
            </Box>
            <Grid container spacing={2}>
                <Grid item container spacing={2}>
                    {lowercase && <Grid item xs={4}>
                        <FastField type="checkbox"
                                   name={validationLowercase}
                                   label={"Lowercase"}
                                   disabled={disabled}
                                   component={SwitchControl}/>
                    </Grid>}
                    {uppercase && <Grid item xs={4}>
                        <FastField type="checkbox"
                                   name={validationUppercase}
                                   label={"Uppercase"}
                                   disabled={disabled}
                                   component={SwitchControl}/>
                    </Grid>}
                    {trim && <Grid item xs={4}>
                        <FastField type="checkbox"
                                   name={validationTrim}
                                   label={"Trim"}
                                   disabled={disabled}
                                   component={SwitchControl}/>
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
                            disabled={disabled}
                            onChange={handleChange}/>
                    </Grid>}

                    {min && <Grid item xs={4}>
                        <DebouncedTextField value={getIn(values, validationMin)}
                                            label={"Min length"}
                                            name={validationMin}
                                            type="number"
                                            size="small"
                                            fullWidth
                                            disabled={disabled}
                                            onChange={handleChange}/>
                    </Grid>}

                    {max && <Grid item xs={4}>
                        <DebouncedTextField value={getIn(values, validationMax)}
                                            label={"Max length"}
                                            name={validationMax}
                                            type="number"
                                            size="small"
                                            fullWidth
                                            disabled={disabled}
                                            onChange={handleChange}/>
                    </Grid>}

                </Grid>

                {matches && <Grid item xs={12}>
                    <FastField name={validationMatches}
                               as={DebouncedTextField}
                               validate={(value:string) => !isValidRegExp(value)}
                               label={"Matches regex"}
                               size="small"
                               disabled={disabled}
                               fullWidth
                               value={matchesStringValue}
                               helperText={matchesError ?? "e.g. /^\\d+$/ for digits only"}
                               error={Boolean(matchesError)}/>
                </Grid>}

            </Grid>
        </>
    );

}
