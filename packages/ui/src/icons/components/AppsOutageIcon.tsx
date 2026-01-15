import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AppsOutageIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"apps_outage"} ref={ref}/>
});

AppsOutageIcon.displayName = "AppsOutageIcon";
