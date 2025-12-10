import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MeetingRoomIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"meeting_room"} ref={ref}/>
});

MeetingRoomIcon.displayName = "MeetingRoomIcon";
