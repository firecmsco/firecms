import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PodcastsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"podcasts"} ref={ref}/>
});

PodcastsIcon.displayName = "PodcastsIcon";
