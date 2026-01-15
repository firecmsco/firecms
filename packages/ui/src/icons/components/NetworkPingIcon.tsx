import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NetworkPingIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"network_ping"} ref={ref}/>
});

NetworkPingIcon.displayName = "NetworkPingIcon";
