import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const EmojiEventsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"emoji_events"} ref={ref}/>
});

EmojiEventsIcon.displayName = "EmojiEventsIcon";
