import React from "react";
import { Grid } from "@mui/material";
import {
    GeneralPropertyValidation
} from "./validation/GeneralPropertyValidation";
import { ValidationPanel } from "./ValidationPanel";

export function BooleanPropertyField({ disabled }: {
    disabled: boolean;
}) {

    return (
        <>
            <Grid item xs={12}>

                <ValidationPanel>
                    <GeneralPropertyValidation disabled={disabled}/>
                </ValidationPanel>

            </Grid>
        </>
    );
}
