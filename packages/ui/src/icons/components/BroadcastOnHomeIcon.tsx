import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BroadcastOnHomeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"broadcast_on_home"} ref={ref}/>
});

BroadcastOnHomeIcon.displayName = "BroadcastOnHomeIcon";
