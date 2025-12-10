import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ArrowUpwardIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"arrow_upward"} ref={ref}/>
});

ArrowUpwardIcon.displayName = "ArrowUpwardIcon";
