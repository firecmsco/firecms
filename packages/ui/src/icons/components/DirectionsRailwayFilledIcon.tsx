import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DirectionsRailwayFilledIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"directions_railway_filled"} ref={ref}/>
});

DirectionsRailwayFilledIcon.displayName = "DirectionsRailwayFilledIcon";
