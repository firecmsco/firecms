import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PermDeviceInfoIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"perm_device_info"} ref={ref}/>
});

PermDeviceInfoIcon.displayName = "PermDeviceInfoIcon";
