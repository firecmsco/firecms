import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DevicesFoldIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"devices_fold"} ref={ref}/>
});

DevicesFoldIcon.displayName = "DevicesFoldIcon";
