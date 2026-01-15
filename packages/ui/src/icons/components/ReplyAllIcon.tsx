import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ReplyAllIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"reply_all"} ref={ref}/>
});

ReplyAllIcon.displayName = "ReplyAllIcon";
