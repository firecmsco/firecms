import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NotificationsPausedIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"notifications_paused"} ref={ref}/>
});

NotificationsPausedIcon.displayName = "NotificationsPausedIcon";
