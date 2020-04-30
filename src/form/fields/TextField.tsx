import {
    MediaType,
    NumberProperty,
    StringProperty
} from "../../models";
import { Field, getIn } from "formik";
import {
    Box,
    FormControl,
    FormHelperText,
    Input,
    InputLabel
} from "@material-ui/core";
import React, { ReactElement } from "react";
import renderPreviewComponent from "../../preview";
import { CMSFieldProps } from "./CMSFieldProps";

interface TextFieldProps extends CMSFieldProps<string | number, StringProperty | NumberProperty> {
}

export default function TextField({ name, property, includeDescription }: TextFieldProps) {

    return (
        <Field
            required={property.validation?.required}
            name={`${name}`}
        >
            {({
                  disabled,
                  field,
                  form: { isSubmitting, errors, touched, setFieldValue },
                  ...props
              }: any) => {

                const fieldError = getIn(errors, field.name);
                const showError = getIn(touched, field.name) && !!fieldError;

                const value = field.value;

                let mediaType: MediaType | undefined;
                if (property.dataType === "string")
                    mediaType = property.urlMediaType;

                return (
                    <React.Fragment>

                        <FormControl
                            required={property.validation?.required}
                            error={showError}
                            disabled={disabled !== undefined ? disabled : isSubmitting}
                            fullWidth>
                            <InputLabel>{property.title || name}</InputLabel>
                            <Input
                                type={property.dataType === "number" ? "number" : undefined}
                                defaultValue={value}
                                onChange={(evt) => setFieldValue(
                                    name,
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
            }}
        </Field>
    );

}
