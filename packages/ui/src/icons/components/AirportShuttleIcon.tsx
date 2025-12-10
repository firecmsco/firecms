import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AirportShuttleIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"airport_shuttle"} ref={ref}/>
});

AirportShuttleIcon.displayName = "AirportShuttleIcon";
