import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FormatColorTextIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"format_color_text"} ref={ref}/>
});

FormatColorTextIcon.displayName = "FormatColorTextIcon";
