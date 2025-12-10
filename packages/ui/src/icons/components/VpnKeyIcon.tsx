import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const VpnKeyIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"vpn_key"} ref={ref}/>
});

VpnKeyIcon.displayName = "VpnKeyIcon";
