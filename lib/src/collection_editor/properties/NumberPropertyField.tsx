import React from "react";
import { Grid, Typography } from "@mui/material";
import {
    NumberPropertyValidation
} from "./validation/NumberPropertyValidation";
import { ExpandablePanel } from "../../core/components/ExpandablePanel";

export function NumberPropertyField() {
    return (
        <Grid item xs={12}>

            <ExpandablePanel title={
                <Typography variant={"button"}>
                    Validation
                </Typography>}>
                <NumberPropertyValidation/>
            </ExpandablePanel>

        </Grid>
    );
}
