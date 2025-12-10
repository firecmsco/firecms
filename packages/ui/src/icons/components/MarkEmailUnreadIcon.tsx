import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MarkEmailUnreadIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"mark_email_unread"} ref={ref}/>
});

MarkEmailUnreadIcon.displayName = "MarkEmailUnreadIcon";
