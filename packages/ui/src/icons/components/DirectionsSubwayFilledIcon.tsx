import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DirectionsSubwayFilledIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"directions_subway_filled"} ref={ref}/>
});

DirectionsSubwayFilledIcon.displayName = "DirectionsSubwayFilledIcon";
