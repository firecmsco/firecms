import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const EventSeatIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"event_seat"} ref={ref}/>
});

EventSeatIcon.displayName = "EventSeatIcon";
