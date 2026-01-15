import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SignalWifiBadIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"signal_wifi_bad"} ref={ref}/>
});

SignalWifiBadIcon.displayName = "SignalWifiBadIcon";
