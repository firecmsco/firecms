import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const EvStationIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"ev_station"} ref={ref}/>
});

EvStationIcon.displayName = "EvStationIcon";
