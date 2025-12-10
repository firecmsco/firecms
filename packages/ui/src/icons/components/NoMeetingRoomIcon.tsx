import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NoMeetingRoomIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"no_meeting_room"} ref={ref}/>
});

NoMeetingRoomIcon.displayName = "NoMeetingRoomIcon";
