import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FloodIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"flood"} ref={ref}/>
});

FloodIcon.displayName = "FloodIcon";
