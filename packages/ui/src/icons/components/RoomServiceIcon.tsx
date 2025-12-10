import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RoomServiceIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"room_service"} ref={ref}/>
});

RoomServiceIcon.displayName = "RoomServiceIcon";
