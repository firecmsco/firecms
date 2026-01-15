import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const EventRepeatIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"event_repeat"} ref={ref}/>
});

EventRepeatIcon.displayName = "EventRepeatIcon";
