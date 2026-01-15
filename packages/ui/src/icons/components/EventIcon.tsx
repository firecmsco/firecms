import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const EventIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"event"} ref={ref}/>
});

EventIcon.displayName = "EventIcon";
