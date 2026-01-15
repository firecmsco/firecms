import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WifiCalling3Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"wifi_calling_3"} ref={ref}/>
});

WifiCalling3Icon.displayName = "WifiCalling3Icon";
