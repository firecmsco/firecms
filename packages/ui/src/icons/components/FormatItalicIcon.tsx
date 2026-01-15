import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FormatItalicIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"format_italic"} ref={ref}/>
});

FormatItalicIcon.displayName = "FormatItalicIcon";
