import { TextField, Theme, withStyles } from "@material-ui/core";
import React, { ReactElement } from "react";
import { CMSFieldProps, FieldDescription } from "@camberi/firecms";

interface CustomColorTextFieldProps extends CMSFieldProps<string> {
    color: string
}

export const TextFieldWithStyles = withStyles((theme: Theme) => ({
    root: (props: any) => ({
        "& .MuiFilledInput-root": {
            backgroundColor: props.customcolor
        }
    })
}))(TextField);

export default function CustomColorTextField({
                                                 property,
                                                 value,
                                                 color,
                                                 touched,
                                                 error,
                                                 isSubmitting,
                                                 setValue,
                                                 ...props
                                             }: CustomColorTextFieldProps)
    : ReactElement {

    return (
        <>
            <TextFieldWithStyles required={property.validation?.required}
                                 error={!!error}
                                 disabled={isSubmitting}
                                 label={property.title}
                                 value={value ?? ""}
                                 onChange={(evt: any) => {
                                     setValue(
                                         evt.target.value
                                     );
                                 }}
                                 helperText={error}
                                 fullWidth
                                 variant={"filled"}
                                 customcolor={color}/>

            <FieldDescription property={property}/>
        </>

    );

}
