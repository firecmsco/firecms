import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ControlCameraIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"control_camera"} ref={ref}/>
});

ControlCameraIcon.displayName = "ControlCameraIcon";
