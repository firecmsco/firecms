import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RoundaboutRightIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"roundabout_right"} ref={ref}/>
});

RoundaboutRightIcon.displayName = "RoundaboutRightIcon";
