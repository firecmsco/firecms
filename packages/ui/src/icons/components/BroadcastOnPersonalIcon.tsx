import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BroadcastOnPersonalIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"broadcast_on_personal"} ref={ref}/>
});

BroadcastOnPersonalIcon.displayName = "BroadcastOnPersonalIcon";
