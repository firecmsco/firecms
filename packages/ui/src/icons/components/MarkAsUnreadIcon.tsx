import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MarkAsUnreadIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"mark_as_unread"} ref={ref}/>
});

MarkAsUnreadIcon.displayName = "MarkAsUnreadIcon";
