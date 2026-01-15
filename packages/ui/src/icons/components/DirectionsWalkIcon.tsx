import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DirectionsWalkIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"directions_walk"} ref={ref}/>
});

DirectionsWalkIcon.displayName = "DirectionsWalkIcon";
