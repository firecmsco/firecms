import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SubtitlesOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"subtitles_off"} ref={ref}/>
});

SubtitlesOffIcon.displayName = "SubtitlesOffIcon";
