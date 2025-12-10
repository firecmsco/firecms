import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Wifi2BarIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"wifi_2_bar"} ref={ref}/>
});

Wifi2BarIcon.displayName = "Wifi2BarIcon";
