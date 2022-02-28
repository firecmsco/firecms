import React from "react";
import { Grid, Paper, Typography } from "@mui/material";
import {
    StringPropertyValidation
} from "./validation/StringPropertyValidation";

export function StringPropertyField({
                                        widgetId
                                    }: {
    widgetId: "text_field" | "multiline" | "markdown" | "url" | "email";
}) {

    return (
        <>
            <Grid item sx={{ mt: 1 }}>
                <Typography variant={"subtitle2"} >
                    Validation
                </Typography>
                <Paper variant={"outlined"} sx={{ p: 2, mt: 1 }}>
                    {widgetId === "text_field" &&
                        <StringPropertyValidation length={true}
                                                  lowercase={true}
                                                  matches={true}
                                                  max={true}
                                                  min={true}
                                                  trim={true}
                                                  uppercase={true}/>}
                    {widgetId === "multiline" &&
                        <StringPropertyValidation length={true}
                                                  lowercase={true}
                                                  max={true}
                                                  min={true}
                                                  trim={true}
                                                  uppercase={true}/>}
                    {widgetId === "markdown" &&
                        <StringPropertyValidation length={true}
                                                  lowercase={true}
                                                  max={true}
                                                  min={true}
                                                  trim={true}
                                                  uppercase={true}/>}
                    {widgetId === "url" &&
                        <StringPropertyValidation
                            max={true}
                            min={true}
                            trim={true}/>}

                    {widgetId === "email" &&
                        <StringPropertyValidation
                            max={true}
                            min={true}
                            trim={true}/>}
                </Paper>
            </Grid>
        </>
    );
}
