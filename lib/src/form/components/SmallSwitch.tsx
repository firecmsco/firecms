import React from "react";

import { FieldProps } from "formik";
import { FormControlLabel, Switch, Tooltip, Typography } from "@mui/material";


export function SmallSwitch({
                                field,
                                form,
                                label,
                                tooltip
                            }: FieldProps & { label: string, tooltip?: string }) {
    const formControlLabel = <FormControlLabel
        checked={field.value ?? false}
        sx={{ ml: 0 }}
        control={
            <Switch size="small"
                    onChange={(e, checked) => form.setFieldValue(field.name, checked)}/>
        }
        label={<Typography variant={"body2"}>{label}</Typography>}
    />;
    if (tooltip)
        return (
            <Tooltip
                title={tooltip}>
                {formControlLabel}
            </Tooltip>
        );
    return formControlLabel;
}
