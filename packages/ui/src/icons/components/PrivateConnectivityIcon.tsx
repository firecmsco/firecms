import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PrivateConnectivityIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"private_connectivity"} ref={ref}/>
});

PrivateConnectivityIcon.displayName = "PrivateConnectivityIcon";
