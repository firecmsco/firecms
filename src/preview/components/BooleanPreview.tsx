import React from "react";
import { CheckBox, CheckBoxOutlineBlank } from "@mui/icons-material";
import { PreviewComponentProps } from "../preview_component_props";

/**
 * @category Preview components
 */
export default function BooleanPreview({
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
