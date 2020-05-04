import { MediaType, StringProperty } from "../../models";
import { getIn } from "formik";
import {
    Box,
    FormControl,
    FormHelperText,
    Input,
    InputLabel
} from "@material-ui/core";
import React from "react";
import renderPreviewComponent from "../../preview";

import { CMSFieldProps } from "./form_props";

type TextFieldProps = CMSFieldProps<string | number>;

export default function TextField({
                                      field,
                                      form: { isSubmitting, errors, touched, setFieldValue },
                                      property,
                                      includeDescription,
                                      ...props
                                  }: TextFieldProps) {
    const fieldError = getIn(errors, field.name);
    const showError = getIn(touched, field.name) && !!fieldError;

    const value = field.value;

    let mediaType: MediaType | undefined;
    if (property.dataType === "string")
        mediaType = (property as StringProperty).urlMediaType;

    return (
        <React.Fragment>

            <FormControl
                required={property.validation?.required}
                error={showError}
                disabled={isSubmitting}
                fullWidth>
                <InputLabel>{property.title || field.name}</InputLabel>
                <Input
                    type={property.dataType === "number" ? "number" : undefined}
                    defaultValue={value}
                    {...props}
                    onChange={(evt) => setFieldValue(
                        field.name,
                        evt.target.value
                    )}
                />

                {showError && <FormHelperText
                    id="component-error-text">{fieldError}</FormHelperText>}

                {includeDescription && property.description &&
                <FormHelperText>{property.description}</FormHelperText>}

            </FormControl>

            {mediaType && value &&
            <Box m={1}>
                {renderPreviewComponent(value, property)}
            </Box>
            }
        </React.Fragment>
    );

}
