import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const VideoLibraryIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"video_library"} ref={ref}/>
});

VideoLibraryIcon.displayName = "VideoLibraryIcon";
