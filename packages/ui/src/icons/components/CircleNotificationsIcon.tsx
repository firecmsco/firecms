import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CircleNotificationsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"circle_notifications"} ref={ref}/>
});

CircleNotificationsIcon.displayName = "CircleNotificationsIcon";
