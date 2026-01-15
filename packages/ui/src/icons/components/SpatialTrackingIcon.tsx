import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SpatialTrackingIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"spatial_tracking"} ref={ref}/>
});

SpatialTrackingIcon.displayName = "SpatialTrackingIcon";
