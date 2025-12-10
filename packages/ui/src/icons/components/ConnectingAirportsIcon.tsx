import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ConnectingAirportsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"connecting_airports"} ref={ref}/>
});

ConnectingAirportsIcon.displayName = "ConnectingAirportsIcon";
