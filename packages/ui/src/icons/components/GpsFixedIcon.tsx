import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const GpsFixedIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"gps_fixed"} ref={ref}/>
});

GpsFixedIcon.displayName = "GpsFixedIcon";
