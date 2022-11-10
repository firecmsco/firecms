import React from "react";
import { TextField } from "@mui/material";
import { FieldDescription, FieldProps } from "@camberi/firecms";

interface CustomColorTextFieldProps {
    color: string
}

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


    return (
        <>
            <TextField required={property.validation?.required}
                       sx={{
                           backgroundColor: customProps.color
                       }}
                       error={!!error}
                       disabled={isSubmitting}
                       label={property.name}
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
