import React from "react";

import { FieldProps } from "formik";
import { BooleanSwitchWithLabel, Tooltip } from "../../components";

export function SwitchControl({
                                  field,
                                  form,
                                  label,
                                  tooltip,
                                  disabled,
                                  size = "small",
                                  allowIndeterminate
                              }: FieldProps & {
    label: string,
    tooltip?: string,
    disabled?: boolean,
    size: "small" | "medium",
    allowIndeterminate?: boolean
}) {

    const formControlLabel = <BooleanSwitchWithLabel
        label={label}
        size={size}
        position={"start"}
        value={field.value}
        disabled={disabled}
        allowIndeterminate={allowIndeterminate}
        onValueChange={(checked:boolean | null) => form.setFieldValue(field.name, checked)}/>;

    if (tooltip)
        return (
            <Tooltip
                title={tooltip}>
                {formControlLabel}
            </Tooltip>
        );
    return formControlLabel;
}
