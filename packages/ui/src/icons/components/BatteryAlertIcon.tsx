import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BatteryAlertIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"battery_alert"} ref={ref}/>
});

BatteryAlertIcon.displayName = "BatteryAlertIcon";
