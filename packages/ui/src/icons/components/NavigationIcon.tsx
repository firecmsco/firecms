import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NavigationIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"navigation"} ref={ref}/>
});

NavigationIcon.displayName = "NavigationIcon";
