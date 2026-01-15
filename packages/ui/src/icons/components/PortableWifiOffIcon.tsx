import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PortableWifiOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"portable_wifi_off"} ref={ref}/>
});

PortableWifiOffIcon.displayName = "PortableWifiOffIcon";
