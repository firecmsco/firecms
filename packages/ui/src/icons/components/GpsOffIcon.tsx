import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const GpsOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"gps_off"} ref={ref}/>
});

GpsOffIcon.displayName = "GpsOffIcon";
