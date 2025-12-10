import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const EmojiNatureIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"emoji_nature"} ref={ref}/>
});

EmojiNatureIcon.displayName = "EmojiNatureIcon";
