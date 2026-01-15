import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FeaturedPlayListIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"featured_play_list"} ref={ref}/>
});

FeaturedPlayListIcon.displayName = "FeaturedPlayListIcon";
