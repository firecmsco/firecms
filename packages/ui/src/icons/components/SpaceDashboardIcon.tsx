import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SpaceDashboardIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"space_dashboard"} ref={ref}/>
});

SpaceDashboardIcon.displayName = "SpaceDashboardIcon";
