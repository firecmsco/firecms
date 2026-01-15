import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NetworkWifiIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"network_wifi"} ref={ref}/>
});

NetworkWifiIcon.displayName = "NetworkWifiIcon";
