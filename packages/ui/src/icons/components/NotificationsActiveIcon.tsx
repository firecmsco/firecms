import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NotificationsActiveIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"notifications_active"} ref={ref}/>
});

NotificationsActiveIcon.displayName = "NotificationsActiveIcon";
