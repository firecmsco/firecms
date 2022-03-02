import React from "react";

import { getIn, useFormikContext } from "formik";
import { Box, Grid } from "@mui/material";
import DebouncedTextField from "../../../form/components/DebouncedTextField";
import { GeneralPropertyValidation } from "./GeneralPropertyValidation";

export function ArrayPropertyValidation({
                                            max,
                                            min,
                                        }: {
    min?: boolean;
    max?: boolean;
}) {

    const { values, handleChange } = useFormikContext();

    const validationMin = "validation.min";
    const validationMax = "validation.max";

    return (
        <>
            <Box mb={3}>
                <GeneralPropertyValidation/>
            </Box>
            <Grid container spacing={2}>
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
        </>
    );
}
