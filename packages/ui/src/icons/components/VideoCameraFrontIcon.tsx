import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const VideoCameraFrontIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"video_camera_front"} ref={ref}/>
});

VideoCameraFrontIcon.displayName = "VideoCameraFrontIcon";
