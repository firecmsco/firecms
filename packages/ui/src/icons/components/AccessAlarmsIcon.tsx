import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AccessAlarmsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"access_alarms"} ref={ref}/>
});

AccessAlarmsIcon.displayName = "AccessAlarmsIcon";
