import React from "react";
import { CheckBox, CheckBoxOutlineBlank } from "@material-ui/icons";
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
