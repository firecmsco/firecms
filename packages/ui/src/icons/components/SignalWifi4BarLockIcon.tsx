import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SignalWifi4BarLockIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"signal_wifi_4_bar_lock"} ref={ref}/>
});

SignalWifi4BarLockIcon.displayName = "SignalWifi4BarLockIcon";
