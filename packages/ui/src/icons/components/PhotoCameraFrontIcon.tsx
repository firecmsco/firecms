import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PhotoCameraFrontIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"photo_camera_front"} ref={ref}/>
});

PhotoCameraFrontIcon.displayName = "PhotoCameraFrontIcon";
