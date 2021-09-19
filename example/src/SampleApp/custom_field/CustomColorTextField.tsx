import React from "react";
import { TextField, Theme } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { FieldDescription, FieldProps } from "@camberi/firecms";

interface CustomColorTextFieldProps {
    color: string
}

const useStyles = makeStyles<Theme, { customColor: string }>(() => ({
    root: ({ customColor }) => ({
        backgroundColor: customColor
    })
}));

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
                                             }: FieldProps<string, CustomColorTextFieldProps>) {

    const classes = useStyles({ customColor: customProps.color });

    return (
        <>
            <TextField required={property.validation?.required}
                       classes={{
                           root: classes.root
                       }}
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
                       variant={"filled"}/>

            <FieldDescription property={property}/>
        </>

    );

}
