import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BatteryFullIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"battery_full"} ref={ref}/>
});

BatteryFullIcon.displayName = "BatteryFullIcon";
