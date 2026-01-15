import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NetworkWifi3BarIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"network_wifi_3_bar"} ref={ref}/>
});

NetworkWifi3BarIcon.displayName = "NetworkWifi3BarIcon";
