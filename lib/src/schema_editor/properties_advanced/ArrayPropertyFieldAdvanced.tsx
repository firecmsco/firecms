import React, { useCallback } from "react";
import { Grid, Paper, Typography } from "@mui/material";
import { ArrayPropertyValidation } from "./validation/ArrayPropertyValidation";
import { ArrayProperty, Property } from "../../models";
import { getIn, useFormikContext } from "formik";
import { PropertyForm } from "../PropertyEditView";

export function ArrayPropertyFieldAdvanced({ showErrors, existing }: { showErrors: boolean, existing:boolean }) {

    const {
        values,
        handleChange,
        errors,
        setFieldValue,
        touched
    } = useFormikContext<ArrayProperty>();

    const ofProperty = getIn(values, "of");

    const onPropertyChanged = useCallback(({ id, property, namespace }:
                                               { id?: string, property: Property, namespace?: string }) => {
        console.log("onPropertyChanged", property);
        setFieldValue("of", property);
    }, []);

    return (
        <>
            <Grid item >
                <Typography variant={"subtitle2"}>
                    Validation
                </Typography>
                <Paper variant={"outlined"} sx={{ p: 2, mt: 1 }}>
                    <ArrayPropertyValidation/>
                </Paper>
            </Grid>
        </>
    );
}
