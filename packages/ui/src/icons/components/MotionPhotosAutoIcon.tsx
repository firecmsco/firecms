import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MotionPhotosAutoIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"motion_photos_auto"} ref={ref}/>
});

MotionPhotosAutoIcon.displayName = "MotionPhotosAutoIcon";
