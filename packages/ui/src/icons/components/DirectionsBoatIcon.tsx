import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DirectionsBoatIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"directions_boat"} ref={ref}/>
});

DirectionsBoatIcon.displayName = "DirectionsBoatIcon";
