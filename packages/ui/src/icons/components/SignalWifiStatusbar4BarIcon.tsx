import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SignalWifiStatusbar4BarIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"signal_wifi_statusbar_4_bar"} ref={ref}/>
});

SignalWifiStatusbar4BarIcon.displayName = "SignalWifiStatusbar4BarIcon";
