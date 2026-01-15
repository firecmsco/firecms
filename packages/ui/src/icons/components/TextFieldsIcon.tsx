import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TextFieldsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"text_fields"} ref={ref}/>
});

TextFieldsIcon.displayName = "TextFieldsIcon";
