import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DashboardCustomizeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"dashboard_customize"} ref={ref}/>
});

DashboardCustomizeIcon.displayName = "DashboardCustomizeIcon";
