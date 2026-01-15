import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PhotoCameraBackIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"photo_camera_back"} ref={ref}/>
});

PhotoCameraBackIcon.displayName = "PhotoCameraBackIcon";
