import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DirectionsTransitIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"directions_transit"} ref={ref}/>
});

DirectionsTransitIcon.displayName = "DirectionsTransitIcon";
