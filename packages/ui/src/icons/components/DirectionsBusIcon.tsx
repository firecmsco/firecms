import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DirectionsBusIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"directions_bus"} ref={ref}/>
});

DirectionsBusIcon.displayName = "DirectionsBusIcon";
