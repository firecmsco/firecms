import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const EmojiObjectsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"emoji_objects"} ref={ref}/>
});

EmojiObjectsIcon.displayName = "EmojiObjectsIcon";
