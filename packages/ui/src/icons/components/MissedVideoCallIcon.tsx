import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MissedVideoCallIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"missed_video_call"} ref={ref}/>
});

MissedVideoCallIcon.displayName = "MissedVideoCallIcon";
