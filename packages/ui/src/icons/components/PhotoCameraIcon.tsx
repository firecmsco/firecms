import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PhotoCameraIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"photo_camera"} ref={ref}/>
});

PhotoCameraIcon.displayName = "PhotoCameraIcon";
