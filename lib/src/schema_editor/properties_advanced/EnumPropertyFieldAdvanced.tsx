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
                    {!multiselect &&
                        <StringPropertyValidation/>}
                    {multiselect &&
                        <ArrayPropertyValidation/>}
            </Grid>

        </>
    );
}
