import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RoomIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"room"} ref={ref}/>
});

RoomIcon.displayName = "RoomIcon";
