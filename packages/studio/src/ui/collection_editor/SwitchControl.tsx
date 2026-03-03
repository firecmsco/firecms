import React from "react";

import { BooleanSwitchWithLabel, Tooltip } from "@firecms/ui";
import { FormexFieldProps } from "@firecms/formex";

export function SwitchControl({
                                  field,
                                  form,
                                  label,
                                  tooltip,
                                  disabled,
                                  size = "small",
                                  allowIndeterminate
                              }: FormexFieldProps & {
    label: string,
    tooltip?: string,
    disabled?: boolean,
    size?: "small" | "medium",
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
