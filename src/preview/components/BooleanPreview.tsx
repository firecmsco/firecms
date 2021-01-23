import { PreviewComponentProps } from "../../models/preview_component_props";
import React from "react";
import { CheckBox, CheckBoxOutlineBlank } from "@material-ui/icons";


export function BooleanPreview({
                                   name,
                                   value,
                                   property,
                                   size,
                                   entitySchema
                               }: PreviewComponentProps<boolean>): React.ReactElement {

    return value ?
        <CheckBox color="secondary"/>
        :
        <CheckBoxOutlineBlank color="disabled"/>;
}
