import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DirectionsSubwayIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"directions_subway"} ref={ref}/>
});

DirectionsSubwayIcon.displayName = "DirectionsSubwayIcon";
