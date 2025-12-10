import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RoomPreferencesIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"room_preferences"} ref={ref}/>
});

RoomPreferencesIcon.displayName = "RoomPreferencesIcon";
