import React from "react";

import { FieldProps } from "formik";
import { BooleanSwitchWithLabel, Tooltip } from "../../components";

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


    const formControlLabel = <BooleanSwitchWithLabel label={label}
                                   size={size}
                                   value={field.value}
                                   disabled={disabled}
                                   onValueChange={(checked) => form.setFieldValue(field.name, checked)}/>;

    if (tooltip)
        return (
            <Tooltip
                title={tooltip}>
                {formControlLabel}
            </Tooltip>
        );
    return formControlLabel;
}
