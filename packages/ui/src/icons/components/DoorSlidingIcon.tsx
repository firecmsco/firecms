import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DoorSlidingIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"door_sliding"} ref={ref}/>
});

DoorSlidingIcon.displayName = "DoorSlidingIcon";
