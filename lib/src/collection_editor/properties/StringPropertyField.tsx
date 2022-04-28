import React from "react";
import { Grid } from "@mui/material";
import {
    StringPropertyValidation
} from "./validation/StringPropertyValidation";
import { ValidationPanel } from "./ValidationPanel";

export function StringPropertyField({
                                        widgetId,
                                        disabled,
                                        showErrors
                                    }: {
    widgetId: "text_field" | "multiline" | "markdown" | "url" | "email";
    disabled: boolean;
    showErrors: boolean;
}) {

    return (
        <>
            <Grid item xs={12}>

                <ValidationPanel>

                    {widgetId === "text_field" &&
                        <StringPropertyValidation disabled={disabled}
                                                  length={true}
                                                  lowercase={true}
                                                  matches={true}
                                                  max={true}
                                                  min={true}
                                                  trim={true}
                                                  uppercase={true}
                                                  showErrors={showErrors}/>}
                    {widgetId === "multiline" &&
                        <StringPropertyValidation disabled={disabled}
                                                  length={true}
                                                  lowercase={true}
                                                  max={true}
                                                  min={true}
                                                  trim={true}
                                                  uppercase={true}
                                                  showErrors={showErrors}/>}
                    {widgetId === "markdown" &&
                        <StringPropertyValidation disabled={disabled}
                                                  length={true}
                                                  lowercase={true}
                                                  max={true}
                                                  min={true}
                                                  trim={true}
                                                  uppercase={true}
                                                  showErrors={showErrors}/>}
                    {widgetId === "url" &&
                        <StringPropertyValidation disabled={disabled}
                                                  max={true}
                                                  min={true}
                                                  trim={true}
                                                  showErrors={showErrors}/>}

                    {widgetId === "email" &&
                        <StringPropertyValidation disabled={disabled}
                                                  max={true}
                                                  min={true}
                                                  trim={true}
                                                  showErrors={showErrors}/>}

                </ValidationPanel>

            </Grid>
        </>
    );
}
