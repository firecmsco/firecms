import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FormatAlignRightIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"format_align_right"} ref={ref}/>
});

FormatAlignRightIcon.displayName = "FormatAlignRightIcon";
