import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Wifi1BarIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"wifi_1_bar"} ref={ref}/>
});

Wifi1BarIcon.displayName = "Wifi1BarIcon";
