import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LineStyleIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"line_style"} ref={ref}/>
});

LineStyleIcon.displayName = "LineStyleIcon";
