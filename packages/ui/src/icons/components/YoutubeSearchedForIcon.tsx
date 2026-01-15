import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const YoutubeSearchedForIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"youtube_searched_for"} ref={ref}/>
});

YoutubeSearchedForIcon.displayName = "YoutubeSearchedForIcon";
