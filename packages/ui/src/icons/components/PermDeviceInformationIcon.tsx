import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PermDeviceInformationIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"perm_device_information"} ref={ref}/>
});

PermDeviceInformationIcon.displayName = "PermDeviceInformationIcon";
