import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FormatAlignJustifyIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"format_align_justify"} ref={ref}/>
});

FormatAlignJustifyIcon.displayName = "FormatAlignJustifyIcon";
