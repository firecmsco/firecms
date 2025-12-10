import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SignalWifi0BarIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"signal_wifi_0_bar"} ref={ref}/>
});

SignalWifi0BarIcon.displayName = "SignalWifi0BarIcon";
