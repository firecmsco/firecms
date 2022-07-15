import React from "react";
import { CheckBox, CheckBoxOutlineBlank } from "@mui/icons-material";

/**
 * @category Preview components
 */
export function BooleanPreview({ value }: { value: boolean }): React.ReactElement {
    return value
        ? <CheckBox color="secondary"/>
        : <CheckBoxOutlineBlank color="disabled"/>;
}
