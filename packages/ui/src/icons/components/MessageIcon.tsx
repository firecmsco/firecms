import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MessageIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"message"} ref={ref}/>
});

MessageIcon.displayName = "MessageIcon";
