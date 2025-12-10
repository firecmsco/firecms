import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DeviceUnknownIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"device_unknown"} ref={ref}/>
});

DeviceUnknownIcon.displayName = "DeviceUnknownIcon";
