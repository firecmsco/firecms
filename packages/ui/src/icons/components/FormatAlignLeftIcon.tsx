import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FormatAlignLeftIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"format_align_left"} ref={ref}/>
});

FormatAlignLeftIcon.displayName = "FormatAlignLeftIcon";
