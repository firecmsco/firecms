import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const EditNotificationsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"edit_notifications"} ref={ref}/>
});

EditNotificationsIcon.displayName = "EditNotificationsIcon";
