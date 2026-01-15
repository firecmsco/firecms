import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DirectionsBoatFilledIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"directions_boat_filled"} ref={ref}/>
});

DirectionsBoatFilledIcon.displayName = "DirectionsBoatFilledIcon";
