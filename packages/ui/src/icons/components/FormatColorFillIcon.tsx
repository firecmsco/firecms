import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FormatColorFillIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"format_color_fill"} ref={ref}/>
});

FormatColorFillIcon.displayName = "FormatColorFillIcon";
