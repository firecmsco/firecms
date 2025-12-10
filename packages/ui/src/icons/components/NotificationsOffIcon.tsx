import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NotificationsOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"notifications_off"} ref={ref}/>
});

NotificationsOffIcon.displayName = "NotificationsOffIcon";
