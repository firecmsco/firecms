import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const EmojiSymbolsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"emoji_symbols"} ref={ref}/>
});

EmojiSymbolsIcon.displayName = "EmojiSymbolsIcon";
