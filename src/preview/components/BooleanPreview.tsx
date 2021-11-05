import React from "react";
import { CheckBox, CheckBoxOutlineBlank } from "@mui/icons-material";
import { PreviewComponentProps } from "../PreviewComponentProps";

/**
 * @category Preview components
 */
export function BooleanPreview({
                                   name,
                                   value,
                                   property,
                                   size
                               }: PreviewComponentProps<boolean>): React.ReactElement {

    return value ?
        <CheckBox color="secondary"/>
        :
        <CheckBoxOutlineBlank color="disabled"/>;
}
