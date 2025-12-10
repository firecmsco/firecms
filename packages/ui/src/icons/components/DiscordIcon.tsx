import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DiscordIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"discord"} ref={ref}/>
});

DiscordIcon.displayName = "DiscordIcon";
