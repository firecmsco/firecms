import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NotificationImportantIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"notification_important"} ref={ref}/>
});

NotificationImportantIcon.displayName = "NotificationImportantIcon";
