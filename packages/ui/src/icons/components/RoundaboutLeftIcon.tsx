import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RoundaboutLeftIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"roundabout_left"} ref={ref}/>
});

RoundaboutLeftIcon.displayName = "RoundaboutLeftIcon";
