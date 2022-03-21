import React from "react";
import { Grid } from "@mui/material";
import { ArrayPropertyValidation } from "./validation/ArrayPropertyValidation";

export function ArrayPropertyFieldAdvanced({
                                               showErrors,
                                               existing
                                           }: { showErrors: boolean, existing: boolean }) {

    return (
        <>
            <Grid item>
                <ArrayPropertyValidation/>
            </Grid>
        </>
    );
}
