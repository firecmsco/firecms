import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TimeToLeaveIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"time_to_leave"} ref={ref}/>
});

TimeToLeaveIcon.displayName = "TimeToLeaveIcon";
