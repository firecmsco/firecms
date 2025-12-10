import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MotionPhotosOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"motion_photos_off"} ref={ref}/>
});

MotionPhotosOffIcon.displayName = "MotionPhotosOffIcon";
