import React from "react";
import { Grid, Paper, Typography } from "@mui/material";
import {
    StringPropertyValidation
} from "./validation/StringPropertyValidation";
import { ArrayPropertyValidation } from "./validation/ArrayPropertyValidation";

export function EnumPropertyFieldAdvanced({
                                      multiselect,
                                      updateIds
                                  }: {
    multiselect: boolean, updateIds: boolean
}) {

    return (
        <>
            <Grid item>
                <Typography variant={"subtitle2"} >
                    Validation
                </Typography>
                <Paper variant={"outlined"} sx={{ p: 2, mt: 1 }}>
                    {!multiselect &&
                        <StringPropertyValidation/>}
                    {multiselect &&
                        <ArrayPropertyValidation/>}
                </Paper>
            </Grid>

        </>
    );
}
