import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ChargingStationIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"charging_station"} ref={ref}/>
});

ChargingStationIcon.displayName = "ChargingStationIcon";
