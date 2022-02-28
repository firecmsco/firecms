import React from "react";
import { Grid, Paper, Typography } from "@mui/material";
import {
    GeneralPropertyValidation
} from "./validation/GeneralPropertyValidation";

export function BooleanPropertyField() {

    return (
        <>
            <Grid item sx={{ mt: 1 }}>
                <Typography variant={"subtitle2"} >
                    Validation
                </Typography>
                <Paper variant={"outlined"} sx={{ p: 2, mt: 1 }}>
                    <GeneralPropertyValidation/>
                </Paper>
            </Grid>
        </>
    );
}
