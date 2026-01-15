import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WifiLockIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"wifi_lock"} ref={ref}/>
});

WifiLockIcon.displayName = "WifiLockIcon";
