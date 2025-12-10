import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DashboardIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"dashboard"} ref={ref}/>
});

DashboardIcon.displayName = "DashboardIcon";
