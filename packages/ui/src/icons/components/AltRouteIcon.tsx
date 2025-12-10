import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AltRouteIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"alt_route"} ref={ref}/>
});

AltRouteIcon.displayName = "AltRouteIcon";
