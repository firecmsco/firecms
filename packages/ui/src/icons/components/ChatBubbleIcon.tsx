import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ChatBubbleIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"chat_bubble"} ref={ref}/>
});

ChatBubbleIcon.displayName = "ChatBubbleIcon";
