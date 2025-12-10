import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const VpnKeyOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"vpn_key_off"} ref={ref}/>
});

VpnKeyOffIcon.displayName = "VpnKeyOffIcon";
