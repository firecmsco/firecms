import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SignalWifi4BarIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"signal_wifi_4_bar"} ref={ref}/>
});

SignalWifi4BarIcon.displayName = "SignalWifi4BarIcon";
