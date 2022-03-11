import React, { useCallback, useState } from "react";
import { Button, Grid, Paper, Typography } from "@mui/material";
import { ArrayProperty, Property } from "../../models";
import { getIn, useFormikContext } from "formik";
import { PropertyForm } from "../PropertyEditView";
import { PropertyFieldPreview } from "../PropertyFieldPreview";

export function ArrayPropertyField({
                                       showErrors,
                                       existing
                                   }: { showErrors: boolean, existing: boolean }) {

    const {
        values,
        handleChange,
        errors,
        setFieldValue,
        touched
    } = useFormikContext<ArrayProperty>();

    const [propertyDialogOpen, setPropertyDialogOpen] = useState(false);
    const ofProperty = getIn(values, "of");

    const onPropertyChanged = useCallback(({ id, property, namespace }:
                                               { id?: string, property: Property, namespace?: string }) => {
        console.log("onPropertyChanged", property);
        setFieldValue("of", property);
    }, []);

    return (
        <>
            <Grid item>
                <Typography variant={"subtitle2"}>
                    Repeat component
                </Typography>
                <Paper variant={"outlined"} sx={{ p: 2, mt: 1 }}>
                    {ofProperty && <PropertyFieldPreview property={ofProperty}
                                                         onClick={() => setPropertyDialogOpen(true)}/>}
                    <Button variant={"outlined"}
                            onClick={() => setPropertyDialogOpen(true)}>Edit
                        repeat component</Button>
                    <PropertyForm asDialog={true}
                                  open={propertyDialogOpen}
                                  existing={existing}
                                  onOkClicked={() => setPropertyDialogOpen(false)}
                                  property={ofProperty}
                                  includeIdAndTitle={false}
                                  onPropertyChanged={onPropertyChanged}
                                  forceShowErrors={showErrors}/>
                </Paper>
            </Grid>
        </>
    );
}
