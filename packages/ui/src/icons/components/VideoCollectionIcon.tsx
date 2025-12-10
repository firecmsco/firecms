import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const VideoCollectionIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"video_collection"} ref={ref}/>
});

VideoCollectionIcon.displayName = "VideoCollectionIcon";
