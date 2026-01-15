import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const VideoStableIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"video_stable"} ref={ref}/>
});

VideoStableIcon.displayName = "VideoStableIcon";
