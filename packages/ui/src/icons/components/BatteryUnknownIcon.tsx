import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BatteryUnknownIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"battery_unknown"} ref={ref}/>
});

BatteryUnknownIcon.displayName = "BatteryUnknownIcon";
