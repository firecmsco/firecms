import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CameraRearIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"camera_rear"} ref={ref}/>
});

CameraRearIcon.displayName = "CameraRearIcon";
