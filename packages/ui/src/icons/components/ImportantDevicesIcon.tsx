import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ImportantDevicesIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"important_devices"} ref={ref}/>
});

ImportantDevicesIcon.displayName = "ImportantDevicesIcon";
