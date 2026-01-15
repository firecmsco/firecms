import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LyricsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"lyrics"} ref={ref}/>
});

LyricsIcon.displayName = "LyricsIcon";
