import React, { useCallback, useState } from "react";
import { Button, Grid, Paper, Typography } from "@mui/material";
import { ArrayProperty, Property } from "@camberi/firecms";
import { Field, getIn, useFormikContext } from "formik";
import { PropertyForm } from "../PropertyEditView";
import { getWidget } from "@camberi/firecms";
import { PropertyFieldPreview } from "../PropertyFieldPreview";
import { ArrayPropertyValidation } from "./validation/ArrayPropertyValidation";
import { ValidationPanel } from "./ValidationPanel";

export function RepeatPropertyField({
                                        showErrors,
                                        existing,
                                        disabled
                                    }: { showErrors: boolean, existing: boolean, disabled: boolean }) {

    const {
        values,
        handleChange,
        errors,
        setFieldValue,
        touched
    } = useFormikContext<ArrayProperty>();

    const [propertyDialogOpen, setPropertyDialogOpen] = useState(false);
    const ofProperty = getIn(values, "of");
    const ofPropertyError = getIn(touched, "of") && getIn(errors, "of");

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
                        return property?.dataType ? undefined : "You need to specify a repeat field";
                    }}
                >
                    {() => (
                        <Paper variant={"outlined"} sx={{ p: 2, mt: 1 }}>

                            {ofProperty && <PropertyFieldPreview
                                property={ofProperty}
                                onClick={disabled ? undefined : () => setPropertyDialogOpen(true)}
                                includeName={false}
                                includeEditButton={true}
                                selected={false}
                                hasError={false}/>}

                            {!disabled && !ofProperty && <Button variant={"text"}
                                     size={"large"}
                                     color={ofPropertyError ? "error" : "primary"}
                                     onClick={() => setPropertyDialogOpen(true)}>
                                Edit {`${widget ? widget.name : "repeat component"}`}
                            </Button>}

                            <PropertyForm asDialog={true}
                                          inArray={true}
                                          open={propertyDialogOpen}
                                          existing={existing}
                                          onOkClicked={() => setPropertyDialogOpen(false)}
                                          property={ofProperty}
                                          includeIdAndName={false}
                                          onPropertyChanged={onPropertyChanged}
                                          forceShowErrors={showErrors}
                            />
                        </Paper>
                    )}
                </Field>

            </Grid>

            <Grid item xs={12}>

                <ValidationPanel>
                    <ArrayPropertyValidation disabled={disabled}/>
                </ValidationPanel>

            </Grid>
        </>
    );
}
