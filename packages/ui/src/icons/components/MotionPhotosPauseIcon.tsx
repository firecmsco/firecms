import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MotionPhotosPauseIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"motion_photos_pause"} ref={ref}/>
});

MotionPhotosPauseIcon.displayName = "MotionPhotosPauseIcon";
