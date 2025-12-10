import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MusicVideoIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"music_video"} ref={ref}/>
});

MusicVideoIcon.displayName = "MusicVideoIcon";
