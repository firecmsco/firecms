import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RemoveModeratorIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"remove_moderator"} ref={ref}/>
});

RemoveModeratorIcon.displayName = "RemoveModeratorIcon";
