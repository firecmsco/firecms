import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WifiPasswordIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"wifi_password"} ref={ref}/>
});

WifiPasswordIcon.displayName = "WifiPasswordIcon";
