import { PreviewComponentProps } from "../../models";
import React from "react";
import { CheckBox, CheckBoxOutlineBlank } from "@material-ui/icons";


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
