import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PunchClockIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"punch_clock"} ref={ref}/>
});

PunchClockIcon.displayName = "PunchClockIcon";
