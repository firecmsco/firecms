import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LocationHistoryIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"location_history"} ref={ref}/>
});

LocationHistoryIcon.displayName = "LocationHistoryIcon";
