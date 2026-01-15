import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RecentActorsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"recent_actors"} ref={ref}/>
});

RecentActorsIcon.displayName = "RecentActorsIcon";
