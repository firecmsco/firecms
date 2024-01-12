import React, { useCallback, useState } from "react";
import { ArrayProperty, getFieldConfig, Property, PropertyConfig } from "@firecms/core";
import { Button, Paper, Typography } from "@firecms/ui";
import { Field, getIn, useFormikContext } from "formik";
import { PropertyFormDialog } from "../PropertyEditView";
import { PropertyFieldPreview } from "../PropertyFieldPreview";
import { ArrayPropertyValidation } from "./validation/ArrayPropertyValidation";
import { ValidationPanel } from "./validation/ValidationPanel";

export function RepeatPropertyField({
                                        showErrors,
                                        existing,
                                        disabled,
                                        getData,
                                        allowDataInference,
                                        propertyConfigs,
                                        collectionEditable
                                    }: {
    showErrors: boolean,
    existing: boolean,
    disabled: boolean,
    getData?: () => Promise<object[]>;
    allowDataInference: boolean;
    propertyConfigs: Record<string, PropertyConfig>,
    collectionEditable: boolean;
}) {

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

    const widget = ofProperty && getFieldConfig(ofProperty, propertyConfigs);
    return (
        <>
            <div className={"col-span-12"}>
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
                        <Paper className="p-2 mt-4">

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

                            <PropertyFormDialog
                                inArray={true}
                                open={propertyDialogOpen}
                                existingProperty={existing}
                                getData={getData}
                                autoUpdateId={!existing}
                                autoOpenTypeSelect={!existing}
                                onOkClicked={() => setPropertyDialogOpen(false)}
                                allowDataInference={allowDataInference}
                                property={ofProperty}
                                includeIdAndName={false}
                                onPropertyChanged={onPropertyChanged}
                                forceShowErrors={showErrors}
                                propertyConfigs={propertyConfigs}
                                collectionEditable={collectionEditable}
                            />
                        </Paper>
                    )}
                </Field>

            </div>

            <div className={"col-span-12"}>

                <ValidationPanel>
                    <ArrayPropertyValidation disabled={disabled}/>
                </ValidationPanel>

            </div>
        </>
    );
}
