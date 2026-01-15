import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LocalAirportIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"local_airport"} ref={ref}/>
});

LocalAirportIcon.displayName = "LocalAirportIcon";
