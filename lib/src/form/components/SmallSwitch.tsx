import React from "react";

import { FieldProps } from "formik";
import { FormControlLabel, Switch, Typography } from "@mui/material";


export function SmallSwitch({
                         field,
                         form,
                         label
                     }: FieldProps & { label: string }) {
    return <FormControlLabel
        checked={field.value ?? false}
        sx={{ ml: 0 }}
        control={
            <Switch size="small"
                    onChange={(e, checked) => form.setFieldValue(field.name, checked)}/>
        }
        label={<Typography variant={"body2"}>{label}</Typography>}
    />
}
