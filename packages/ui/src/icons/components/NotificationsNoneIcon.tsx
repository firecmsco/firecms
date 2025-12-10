import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NotificationsNoneIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"notifications_none"} ref={ref}/>
});

NotificationsNoneIcon.displayName = "NotificationsNoneIcon";
