import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FlipCameraIosIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"flip_camera_ios"} ref={ref}/>
});

FlipCameraIosIcon.displayName = "FlipCameraIosIcon";
