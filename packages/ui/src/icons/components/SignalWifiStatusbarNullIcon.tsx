import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SignalWifiStatusbarNullIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"signal_wifi_statusbar_null"} ref={ref}/>
});

SignalWifiStatusbarNullIcon.displayName = "SignalWifiStatusbarNullIcon";
