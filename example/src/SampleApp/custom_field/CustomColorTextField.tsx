import React from "react";
import { TextField } from "@mui/material";
import { FieldProps, FieldHelperText, useModeController } from "firecms";

interface CustomColorTextFieldProps {
    color: string
}

export default function CustomColorTextField({
                                                 property,
                                                 value,
                                                 setValue,
                                                 setFieldValue,
                                                 customProps,
                                                 touched,
                                                 includeDescription,
                                                 showError,
                                                 error,
                                                 isSubmitting,
                                                 context, // the rest of the entity values here
                                                 ...props
                                             }: FieldProps<string, CustomColorTextFieldProps>) {

    const { mode } = useModeController();
    const backgroundColor = customProps?.color ?? (mode === "light" ? "#eef4ff" : "#16325f");
    return (
        <>
            <TextField required={property.validation?.required}
                       sx={{
                           backgroundColor
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

            <FieldHelperText includeDescription={includeDescription}
                             showError={showError}
                             error={error}
                             property={property}/>
        </>

    );

}
