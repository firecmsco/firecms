import React from "react";

import { FieldProps } from "formik";
import { FormControlLabel, Switch, Tooltip, Typography } from "@mui/material";

export function SwitchControl({
                                 field,
                                 form,
                                 label,
                                 tooltip,
                                 disabled,
                                 size = "small"
                             }: FieldProps & { label: string, tooltip?: string, disabled?: boolean, size: "small" | "medium" }) {
    const formControlLabel = <FormControlLabel
        checked={field.value ?? false}
        sx={{ ml: 0 }}
        disabled={disabled}
        control={
            <Switch size={size}
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
