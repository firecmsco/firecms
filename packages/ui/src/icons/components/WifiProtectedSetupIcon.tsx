import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WifiProtectedSetupIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"wifi_protected_setup"} ref={ref}/>
});

WifiProtectedSetupIcon.displayName = "WifiProtectedSetupIcon";
