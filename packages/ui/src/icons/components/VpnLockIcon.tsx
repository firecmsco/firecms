import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const VpnLockIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"vpn_lock"} ref={ref}/>
});

VpnLockIcon.displayName = "VpnLockIcon";
