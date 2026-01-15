import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const EventNoteIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"event_note"} ref={ref}/>
});

EventNoteIcon.displayName = "EventNoteIcon";
