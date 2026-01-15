import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FlipCameraAndroidIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"flip_camera_android"} ref={ref}/>
});

FlipCameraAndroidIcon.displayName = "FlipCameraAndroidIcon";
