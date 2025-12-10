import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DirectionsBusFilledIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"directions_bus_filled"} ref={ref}/>
});

DirectionsBusFilledIcon.displayName = "DirectionsBusFilledIcon";
