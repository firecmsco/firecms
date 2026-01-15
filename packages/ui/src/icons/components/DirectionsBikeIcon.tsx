import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DirectionsBikeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"directions_bike"} ref={ref}/>
});

DirectionsBikeIcon.displayName = "DirectionsBikeIcon";
