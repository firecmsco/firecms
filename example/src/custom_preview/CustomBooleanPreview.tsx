import React, { ReactElement } from "react";
import { PreviewComponentProps } from "@camberi/firecms";

import CheckBoxOutlineBlank from "@material-ui/icons/CheckBoxOutlineBlank";
import CheckBoxOutlined from "@material-ui/icons/CheckBoxOutlined";

export default function CustomBooleanPreview({
                                                 value, property, small
                                             }: PreviewComponentProps<boolean>)
    : ReactElement {

    return (
        value ? <CheckBoxOutlined/> : <CheckBoxOutlineBlank/>
    );

}
