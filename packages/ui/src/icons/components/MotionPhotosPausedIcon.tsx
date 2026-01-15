import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MotionPhotosPausedIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"motion_photos_paused"} ref={ref}/>
});

MotionPhotosPausedIcon.displayName = "MotionPhotosPausedIcon";
