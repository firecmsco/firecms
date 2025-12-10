import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NetworkWifi2BarIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"network_wifi_2_bar"} ref={ref}/>
});

NetworkWifi2BarIcon.displayName = "NetworkWifi2BarIcon";
