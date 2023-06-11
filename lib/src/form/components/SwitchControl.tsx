import React from "react";

import { FieldProps } from "formik";
import { FormControlLabel, Switch, Tooltip } from "@mui/material";
import TTypography from "../../migrated/TTypography";

export function SwitchControl({
                                  field,
                                  form,
                                  label,
                                  tooltip,
                                  disabled,
                                  size = "small"
                              }: FieldProps & {
    label: string,
    tooltip?: string,
    disabled?: boolean,
    size: "small" | "medium"
}) {
    const formControlLabel = <FormControlLabel
        checked={field.value ?? false}
        className="ml-0"
        disabled={disabled}
        control={
            <Switch size={size}
                    disabled={disabled}
                    onChange={(e, checked) => form.setFieldValue(field.name, checked)}/>
        }
        label={<TTypography variant={"body2"}>{label}</TTypography>}
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
