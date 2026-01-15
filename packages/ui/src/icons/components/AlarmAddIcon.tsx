import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AlarmAddIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"alarm_add"} ref={ref}/>
});

AlarmAddIcon.displayName = "AlarmAddIcon";
