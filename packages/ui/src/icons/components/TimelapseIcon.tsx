import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TimelapseIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"timelapse"} ref={ref}/>
});

TimelapseIcon.displayName = "TimelapseIcon";
