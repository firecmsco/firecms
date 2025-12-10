import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TimelineIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"timeline"} ref={ref}/>
});

TimelineIcon.displayName = "TimelineIcon";
