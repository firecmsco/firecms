import React from "react";
import { Grid } from "@mui/material";
import {
    NumberPropertyValidation
} from "./validation/NumberPropertyValidation";
import { ValidationPanel } from "./ValidationPanel";

export function NumberPropertyField() {
    return (
        <Grid item xs={12}>

            <ValidationPanel>
                <NumberPropertyValidation/>
            </ValidationPanel>

        </Grid>
    );
}
