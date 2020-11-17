import { EntitySchema } from "../../models";
import { FormControl, FormHelperText, Paper } from "@material-ui/core";
import React from "react";
import { formStyles } from "../../styles";
import { CMSFieldProps } from "../form_props";
import PreviewComponent from "../../preview/PreviewComponent";
import { FieldDescription } from "../../components";
import { LabelWithIcon } from "../../components/LabelWithIcon";
import ErrorBoundary from "../../components/ErrorBoundary";
import { getIn } from "formik";

type DisabledFieldProps = CMSFieldProps<any>;

export default function DisabledField<S extends EntitySchema>({
                                                                  field,
                                                                  form: { isSubmitting, errors, touched, setFieldValue },
                                                                  property,
                                                                  includeDescription,
                                                                  entitySchema
                                                              }: DisabledFieldProps) {

    const classes = formStyles();
    const value = field.value;

    const fieldError = getIn(errors, field.name);
    const showError = getIn(touched, field.name) && !!fieldError;

    return (

        <FormControl fullWidth error={showError}>

            <FormHelperText filled
                            required={property.validation?.required}>
                <LabelWithIcon scaledIcon={false} property={property}/>
            </FormHelperText>

            <Paper
                className={`${classes.paper} ${classes.largePadding}`}
                variant={"outlined"}>

                <ErrorBoundary>
                    <PreviewComponent name={field.name}
                                      value={value}
                                      property={property}
                                      size={"regular"}
                                      entitySchema={entitySchema}/>
                </ErrorBoundary>

            </Paper>

            {showError && <FormHelperText
                id="component-error-text">{fieldError}</FormHelperText>}

            {includeDescription &&
            <FieldDescription property={property}/>}

        </FormControl>
    );
}
