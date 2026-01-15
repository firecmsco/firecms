import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ChatBubbleOutlineIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"chat_bubble_outline"} ref={ref}/>
});

ChatBubbleOutlineIcon.displayName = "ChatBubbleOutlineIcon";
