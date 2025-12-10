import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const VideoSettingsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"video_settings"} ref={ref}/>
});

VideoSettingsIcon.displayName = "VideoSettingsIcon";
