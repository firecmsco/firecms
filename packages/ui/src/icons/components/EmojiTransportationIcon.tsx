import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const EmojiTransportationIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"emoji_transportation"} ref={ref}/>
});

EmojiTransportationIcon.displayName = "EmojiTransportationIcon";
