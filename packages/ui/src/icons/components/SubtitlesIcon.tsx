import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SubtitlesIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"subtitles"} ref={ref}/>
});

SubtitlesIcon.displayName = "SubtitlesIcon";
