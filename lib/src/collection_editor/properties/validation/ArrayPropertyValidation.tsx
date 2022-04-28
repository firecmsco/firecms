import React from "react";

import { getIn, useFormikContext } from "formik";
import { Box, Grid } from "@mui/material";
import DebouncedTextField from "../../../form/components/DebouncedTextField";
import { GeneralPropertyValidation } from "./GeneralPropertyValidation";

export function ArrayPropertyValidation({
                                            max = true,
                                            min = true,
                                            disabled
                                        }: {
    min?: boolean;
    max?: boolean;
    disabled: boolean;
}) {

    const { values, handleChange } = useFormikContext();

    const validationMin = "validation.min";
    const validationMax = "validation.max";

    return (
        <>
            <Box mb={3}>
                <GeneralPropertyValidation disabled={disabled}/>
            </Box>
            <Grid container spacing={2}>
                {min && <Grid item xs={4}>
                    <DebouncedTextField value={getIn(values, validationMin)}
                                        disabled={disabled}
                                        label={"Min length"}
                                        name={validationMin}
                                        type="number"
                                        size="small"
                                        fullWidth
                                        onChange={handleChange}/>
                </Grid>}
                {max && <Grid item xs={4}>
                    <DebouncedTextField value={getIn(values, validationMax)}
                                        disabled={disabled}
                                        label={"Max length"}
                                        name={validationMax}
                                        type="number"
                                        size="small"
                                        fullWidth
                                        onChange={handleChange}/>
                </Grid>}
            </Grid>
        </>
    );
}
