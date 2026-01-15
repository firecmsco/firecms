import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MarkUnreadChatAltIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"mark_unread_chat_alt"} ref={ref}/>
});

MarkUnreadChatAltIcon.displayName = "MarkUnreadChatAltIcon";
