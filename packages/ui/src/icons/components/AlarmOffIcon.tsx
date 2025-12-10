import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AlarmOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"alarm_off"} ref={ref}/>
});

AlarmOffIcon.displayName = "AlarmOffIcon";
