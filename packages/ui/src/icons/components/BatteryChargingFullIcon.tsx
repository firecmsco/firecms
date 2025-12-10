import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BatteryChargingFullIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"battery_charging_full"} ref={ref}/>
});

BatteryChargingFullIcon.displayName = "BatteryChargingFullIcon";
