import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SignalWifiOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"signal_wifi_off"} ref={ref}/>
});

SignalWifiOffIcon.displayName = "SignalWifiOffIcon";
