import React from "react";
import { Grid } from "@mui/material";
import {
    NumberPropertyValidation
} from "./validation/NumberPropertyValidation";

export function NumberPropertyFieldAdvanced() {

    return (
        <>
            <Grid item>
                <NumberPropertyValidation/>
            </Grid>
        </>
    );
}
