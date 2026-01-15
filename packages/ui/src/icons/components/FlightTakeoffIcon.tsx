import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FlightTakeoffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"flight_takeoff"} ref={ref}/>
});

FlightTakeoffIcon.displayName = "FlightTakeoffIcon";
