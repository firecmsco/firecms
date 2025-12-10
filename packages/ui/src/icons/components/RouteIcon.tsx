import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RouteIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"route"} ref={ref}/>
});

RouteIcon.displayName = "RouteIcon";
