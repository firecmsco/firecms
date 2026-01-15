import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ChatIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"chat"} ref={ref}/>
});

ChatIcon.displayName = "ChatIcon";
