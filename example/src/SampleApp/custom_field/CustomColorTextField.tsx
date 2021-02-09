import { TextField, Theme } from "@material-ui/core";
import withStyles from '@material-ui/styles/withStyles';
import React, { ReactElement } from "react";
import { FieldDescription, FieldProps } from "@camberi/firecms";

interface CustomColorTextFieldProps {
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
                                                 setValue,
                                                 customProps,
                                                 touched,
                                                 error,
                                                 isSubmitting,
                                                 context, // the rest of the entity values here
                                                 ...props
                                             }: FieldProps<string, CustomColorTextFieldProps>)
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
                                 customcolor={customProps.color}/>

            <FieldDescription property={property}/>
        </>

    );

}
