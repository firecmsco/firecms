import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const GpsNotFixedIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"gps_not_fixed"} ref={ref}/>
});

GpsNotFixedIcon.displayName = "GpsNotFixedIcon";
