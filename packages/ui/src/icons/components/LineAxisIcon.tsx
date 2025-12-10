import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LineAxisIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"line_axis"} ref={ref}/>
});

LineAxisIcon.displayName = "LineAxisIcon";
