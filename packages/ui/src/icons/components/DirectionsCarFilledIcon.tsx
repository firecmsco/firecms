import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DirectionsCarFilledIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"directions_car_filled"} ref={ref}/>
});

DirectionsCarFilledIcon.displayName = "DirectionsCarFilledIcon";
