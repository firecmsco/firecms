import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AlarmOnIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"alarm_on"} ref={ref}/>
});

AlarmOnIcon.displayName = "AlarmOnIcon";
