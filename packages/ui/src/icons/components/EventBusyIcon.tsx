import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const EventBusyIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"event_busy"} ref={ref}/>
});

EventBusyIcon.displayName = "EventBusyIcon";
