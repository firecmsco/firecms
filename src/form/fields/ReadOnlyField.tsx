import { EntitySchema } from "../../models";
import { FormControl, FormHelperText, Paper } from "@material-ui/core";
import React from "react";
import { formStyles } from "../../styles";
import { FieldProps } from "../../models/form_props";
import { PreviewComponent } from "../../preview";
import { FieldDescription } from "../../components";
import { LabelWithIcon } from "../components/LabelWithIcon";
import ErrorBoundary from "../../components/ErrorBoundary";

type DisabledFieldProps = FieldProps<any>;

export default function ReadOnlyField<S extends EntitySchema>({
                                                                  name,
                                                                  value,
                                                                  setValue,
                                                                  error,
                                                                  showError,
                                                                  isSubmitting,
                                                                  touched,
                                                                  tableMode,
                                                                  property,
                                                                  includeDescription,
                                                                  context
                                                              }: DisabledFieldProps) {

    const classes = formStyles();

    return (

        <FormControl fullWidth error={showError}>

            {!tableMode && <FormHelperText filled
                                           required={property.validation?.required}>
                <LabelWithIcon scaledIcon={true} property={property}/>
            </FormHelperText>}

            <Paper
                className={`${classes.paper} ${classes.largePadding}`}
                variant={"outlined"}>

                <ErrorBoundary>
                    <PreviewComponent name={name}
                                      value={value}
                                      property={property}
                                      size={"regular"}/>
                </ErrorBoundary>

            </Paper>

            {showError
            && typeof error === "string"
            && <FormHelperText>{error}</FormHelperText>}

            {includeDescription &&
            <FieldDescription property={property}/>}

        </FormControl>
    );
}
