import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MarkChatUnreadIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"mark_chat_unread"} ref={ref}/>
});

MarkChatUnreadIcon.displayName = "MarkChatUnreadIcon";
