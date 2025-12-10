import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NotificationsOnIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"notifications_on"} ref={ref}/>
});

NotificationsOnIcon.displayName = "NotificationsOnIcon";
