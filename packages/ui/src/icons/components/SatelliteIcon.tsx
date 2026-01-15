import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SatelliteIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"satellite"} ref={ref}/>
});

SatelliteIcon.displayName = "SatelliteIcon";
