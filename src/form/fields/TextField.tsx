import { MediaType, StringProperty } from "../../models";
import { getIn } from "formik";
import {
    Box,
    FormControl,
    FormControlLabel,
    FormHelperText,
    Input,
    InputLabel,
    Switch,
    Typography
} from "@material-ui/core";
import React from "react";
import renderPreviewComponent from "../../preview";

import { CMSFieldProps } from "./form_props";

interface TextFieldProps extends CMSFieldProps<string | number> {
    allowInfinity?: boolean
}

export default function TextField({
                                      field,
                                      form: { isSubmitting, errors, touched, setFieldValue },
                                      property,
                                      includeDescription,
                                      allowInfinity,
                                      createFormField,
                                      ...props
                                  }: TextFieldProps) {

    const fieldError = getIn(errors, field.name);
    const showError = getIn(touched, field.name) && !!fieldError;

    let mediaType: MediaType | undefined;
    if (property.dataType === "string")
        mediaType = (property as StringProperty).urlMediaType;

    const value = field.value ? field.value : "";
    const updateValue = (newValue: typeof value) => {

        if (!newValue) {
            setFieldValue(
                field.name,
                null
            );
        } else if (inputType === "number") {
            const numValue = parseFloat(newValue);
            setFieldValue(
                field.name,
                numValue
            );
        } else {
            setFieldValue(
                field.name,
                newValue
            );
        }
    };

    const valueIsInfinity = value === Infinity;
    const inputType = !valueIsInfinity && property.dataType === "number" ? "number" : undefined;
    return (
        <React.Fragment>

            <FormControl
                required={property.validation?.required}
                error={showError}
                disabled={isSubmitting}
                fullWidth>
                <InputLabel>{property.title || field.name}</InputLabel>
                <Input
                    type={inputType}
                    value={valueIsInfinity ? "Infinity" : value}
                    {...props}
                    disabled={valueIsInfinity}
                    onChange={(evt) => {
                        updateValue(evt.target.value);
                    }}
                />

                {allowInfinity &&
                <FormControlLabel
                    checked={valueIsInfinity}
                    labelPlacement={"start"}
                    control={
                        <Switch
                            size={"small"}
                            type={"checkbox"}
                            onChange={(evt) => {
                                updateValue(
                                    evt.target.checked ? Infinity : undefined);
                            }}/>
                    }
                    disabled={property.disabled || isSubmitting}
                    label={
                        <Typography variant={"caption"}>
                            Set value to Infinity
                        </Typography>
                    }
                />
                }

                {showError && <FormHelperText
                    id="component-error-text">{fieldError}</FormHelperText>}

                {includeDescription && property.description &&
                <FormHelperText>{property.description}</FormHelperText>}

            </FormControl>

            {mediaType && value &&
            <Box m={1}>
                {renderPreviewComponent(value, property, false)}
            </Box>
            }
        </React.Fragment>
    );

}
