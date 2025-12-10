import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NotificationAddIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"notification_add"} ref={ref}/>
});

NotificationAddIcon.displayName = "NotificationAddIcon";
