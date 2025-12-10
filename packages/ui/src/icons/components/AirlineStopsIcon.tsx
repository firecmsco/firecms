import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AirlineStopsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"airline_stops"} ref={ref}/>
});

AirlineStopsIcon.displayName = "AirlineStopsIcon";
