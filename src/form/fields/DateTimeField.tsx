import { getIn } from "formik";
import React from "react";
import { DateTimePicker } from "@material-ui/pickers";

import { CMSFieldProps } from "../form_props";
import "firebase/firestore";

import { FieldDescription } from "../../util";

type DateTimeFieldProps = CMSFieldProps<firebase.firestore.Timestamp> ;

export default function DateTimeField({
                                          field,
                                          form: { isSubmitting, errors, touched, setFieldValue, setFieldTouched },
                                          property,
                                          createFormField,
                                          includeDescription,
                                          ...props
                                      }: DateTimeFieldProps) {


    const fieldError = getIn(errors, field.name);
    const showError = getIn(touched, field.name) && !!fieldError;

    const value = field.value;

    return (
        <React.Fragment>
            <DateTimePicker
                fullWidth
                clearable
                value={value}
                label={property.title}
                error={showError}
                disabled={property.disabled !== undefined ? property.disabled : isSubmitting}
                helperText={showError ? fieldError : null}
                onChange={(dateValue) => {
                    setFieldTouched(field.name);
                    return setFieldValue(
                        field.name,
                        dateValue
                    );
                }}
                {...props}
            />
            {includeDescription &&
            <FieldDescription property={property}/>}
        </React.Fragment>
    );
}
