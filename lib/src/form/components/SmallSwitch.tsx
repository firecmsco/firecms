import React from "react";

import { FieldProps } from "formik";
import { FormControlLabel, Switch, Tooltip, Typography } from "@mui/material";

export function SmallSwitch({
                                field,
                                form,
                                label,
                                tooltip,
                                disabled
                            }: FieldProps & { label: string, tooltip?: string, disabled?: boolean }) {
    const formControlLabel = <FormControlLabel
        checked={field.value ?? false}
        sx={{ ml: 0 }}
        disabled={disabled}
        control={
            <Switch size="small"
                    disabled={disabled}
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
