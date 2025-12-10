import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const EmojiEmotionsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"emoji_emotions"} ref={ref}/>
});

EmojiEmotionsIcon.displayName = "EmojiEmotionsIcon";
