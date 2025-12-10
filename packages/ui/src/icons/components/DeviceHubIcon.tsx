import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DeviceHubIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"device_hub"} ref={ref}/>
});

DeviceHubIcon.displayName = "DeviceHubIcon";
