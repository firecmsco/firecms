import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FlightClassIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"flight_class"} ref={ref}/>
});

FlightClassIcon.displayName = "FlightClassIcon";
