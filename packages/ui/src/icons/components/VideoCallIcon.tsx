import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const VideoCallIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"video_call"} ref={ref}/>
});

VideoCallIcon.displayName = "VideoCallIcon";
