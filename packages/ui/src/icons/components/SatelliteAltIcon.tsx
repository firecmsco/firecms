import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SatelliteAltIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"satellite_alt"} ref={ref}/>
});

SatelliteAltIcon.displayName = "SatelliteAltIcon";
