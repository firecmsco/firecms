import { getIn } from "formik";
import { TextField, Theme, withStyles } from "@material-ui/core";
import React, { ReactElement } from "react";
import { CMSFieldProps, FieldDescription } from "@camberi/firecms";

interface CustomColorTextFieldProps extends CMSFieldProps<string> {
    color: string
}

export const TextFieldWithStyles = withStyles((theme: Theme) => ({
    root: (props:any) => ({
        "& .MuiFilledInput-root": {
            backgroundColor: props.customcolor,
        }
    })
}))(TextField);

export default function CustomColorTextField({
                                                 property,
                                                 field,
                                                 color,
                                                 form: { isSubmitting, errors, touched, setFieldValue, setFieldTouched },
                                                 ...props
                                             }: CustomColorTextFieldProps)
    : ReactElement {

    const fieldError = getIn(errors, field.name);
    const showError = getIn(touched, field.name) && !!fieldError;

    const value = field.value;

    return (
        <>
            <TextFieldWithStyles required={property.validation?.required}
                                 error={showError}
                                 disabled={isSubmitting}
                                 label={property.title}
                                 value={value ?? ""}
                                 onChange={(evt:any) => {
                                     setFieldTouched(field.name);
                                     setFieldValue(
                                         field.name,
                                         evt.target.value
                                     );
                                 }}
                                 helperText={showError && fieldError}
                                 fullWidth
                                 variant={"filled"}
                                 customcolor={color} />

            <FieldDescription property={property}/>
        </>

    );

}
