import React, { useCallback, useState } from "react";
import { Button, Grid, Paper, Typography } from "@mui/material";
import { ArrayProperty, Property } from "../../models";
import { Field, getIn, useFormikContext } from "formik";
import { PropertyForm } from "../PropertyEditView";
import { getBadgeForWidget } from "../../core/util/property_utils";
import { getWidget } from "../../core/util/widgets";

export function RepeatPropertyField({
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
    const ofPropertyError = getIn(errors, "of");

    const onPropertyChanged = useCallback(({ id, property, namespace }:
                                               { id?: string, property: Property, namespace?: string }) => {
        setFieldValue("of", property);
    }, []);

    const widget = ofProperty && getWidget(ofProperty);
    return (
        <>
            <Grid item>
                <Typography variant={"subtitle2"}>
                    Repeat component
                </Typography>
                <Field
                    name={"of"}
                    value={ofProperty}
                    validate={(property: Property) => {
                        return property?.dataType ? undefined : "You need to specify a repeat property";
                    }}
                >
                    {() => (
                        <Paper variant={"outlined"} sx={{ p: 2, mt: 1 }}>
                            <Button variant={"text"}
                                    size={"large"}
                                    color={ofPropertyError ? "error" : "primary"}
                                    onClick={() => setPropertyDialogOpen(true)}
                                    startIcon={widget && getBadgeForWidget(widget)}>
                                Edit {`${widget ? widget.name : "repeat component"}`}
                            </Button>
                            <PropertyForm asDialog={true}
                                          inArray={true}
                                          open={propertyDialogOpen}
                                          existing={existing}
                                          onOkClicked={() => setPropertyDialogOpen(false)}
                                          property={ofProperty}
                                          includeIdAndTitle={false}
                                          onPropertyChanged={onPropertyChanged}
                                          forceShowErrors={showErrors}/>
                        </Paper>
                    )}
                </Field>

            </Grid>
        </>
    );
}
