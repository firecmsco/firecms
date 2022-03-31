import React from "react";
import { Grid } from "@mui/material";
import {
    GeneralPropertyValidation
} from "./validation/GeneralPropertyValidation";

export function DateTimePropertyFieldAdvanced() {

    return (
        <>
            <Grid item >
                <GeneralPropertyValidation/>
            </Grid>
        </>
    );
}
