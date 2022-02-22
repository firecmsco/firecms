import React from "react";
import { CheckBox, CheckBoxOutlineBlank } from "@mui/icons-material";
import { PreviewComponentProps } from "../internal";

/**
 * @category Preview components
 */
export function BooleanPreview({
                                   propertyKey,
                                   value,
                                   property,
                                   size
                               }: PreviewComponentProps<boolean>): React.ReactElement {

    return value
        ? <CheckBox color="secondary"/>
        : <CheckBoxOutlineBlank color="disabled"/>;
}
