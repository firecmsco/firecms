import { getIn } from "formik";
import React from "react";
import { DateTimePicker } from "@material-ui/pickers";

import { CMSFieldProps } from "./form_props";
import firebase from "firebase";

type DateTimeFieldProps = CMSFieldProps<firebase.firestore.Timestamp> ;

export default function DateTimeField({
                                          field,
                                          form: { isSubmitting, errors, touched, setFieldValue },
                                          property,
                                          createFormField,
                                          ...props
                                      }: DateTimeFieldProps) {


    const fieldError = getIn(errors, field.name);
    const showError = getIn(touched, field.name) && !!fieldError;

    const value = field.value;

    return (
        <DateTimePicker
            fullWidth
            clearable
            value={value}
            label={property.title || field.name}
            error={showError}
            disabled={property.disabled !== undefined ? property.disabled : isSubmitting}
            helperText={showError ? fieldError : property.description}
            onChange={(dateValue) => setFieldValue(
                field.name,
                dateValue
            )}
            {...props}
        />
    );
}
