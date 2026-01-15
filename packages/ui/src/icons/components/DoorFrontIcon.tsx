import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DoorFrontIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"door_front"} ref={ref}/>
});

DoorFrontIcon.displayName = "DoorFrontIcon";
