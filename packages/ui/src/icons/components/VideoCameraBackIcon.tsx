import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const VideoCameraBackIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"video_camera_back"} ref={ref}/>
});

VideoCameraBackIcon.displayName = "VideoCameraBackIcon";
