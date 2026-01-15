import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MarkChatReadIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"mark_chat_read"} ref={ref}/>
});

MarkChatReadIcon.displayName = "MarkChatReadIcon";
