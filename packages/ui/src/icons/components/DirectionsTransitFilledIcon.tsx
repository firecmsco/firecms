import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DirectionsTransitFilledIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"directions_transit_filled"} ref={ref}/>
});

DirectionsTransitFilledIcon.displayName = "DirectionsTransitFilledIcon";
