import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MotionPhotosOnIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"motion_photos_on"} ref={ref}/>
});

MotionPhotosOnIcon.displayName = "MotionPhotosOnIcon";
