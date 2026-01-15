import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NetworkWifi1BarIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"network_wifi_1_bar"} ref={ref}/>
});

NetworkWifi1BarIcon.displayName = "NetworkWifi1BarIcon";
