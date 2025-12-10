import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const EventAvailableIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"event_available"} ref={ref}/>
});

EventAvailableIcon.displayName = "EventAvailableIcon";
