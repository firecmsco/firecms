import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CameraIndoorIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"camera_indoor"} ref={ref}/>
});

CameraIndoorIcon.displayName = "CameraIndoorIcon";
