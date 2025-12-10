import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BatteryStdIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"battery_std"} ref={ref}/>
});

BatteryStdIcon.displayName = "BatteryStdIcon";
