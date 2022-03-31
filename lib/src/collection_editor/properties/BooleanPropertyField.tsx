import React from "react";
import { Grid, Typography } from "@mui/material";
import {
    GeneralPropertyValidation
} from "./validation/GeneralPropertyValidation";
import { ExpandablePanel } from "../../core/components/ExpandablePanel";

export function BooleanPropertyField() {

    return (
        <>
            <Grid item xs={12}>

                <ExpandablePanel title={
                    <Typography variant={"button"}>
                        Validation
                    </Typography>}>
                    <GeneralPropertyValidation/>
                </ExpandablePanel>

            </Grid>
        </>
    );
}
