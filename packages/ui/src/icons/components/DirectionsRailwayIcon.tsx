import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DirectionsRailwayIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"directions_railway"} ref={ref}/>
});

DirectionsRailwayIcon.displayName = "DirectionsRailwayIcon";
