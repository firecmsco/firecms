import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FlightLandIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"flight_land"} ref={ref}/>
});

FlightLandIcon.displayName = "FlightLandIcon";
