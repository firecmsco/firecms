import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WheelchairPickupIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"wheelchair_pickup"} ref={ref}/>
});

WheelchairPickupIcon.displayName = "WheelchairPickupIcon";
