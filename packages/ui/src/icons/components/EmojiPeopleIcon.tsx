import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const EmojiPeopleIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"emoji_people"} ref={ref}/>
});

EmojiPeopleIcon.displayName = "EmojiPeopleIcon";
