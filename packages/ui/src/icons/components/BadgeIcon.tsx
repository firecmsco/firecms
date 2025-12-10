import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BadgeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"badge"} ref={ref}/>
});

BadgeIcon.displayName = "BadgeIcon";
