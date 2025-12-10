import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FeaturedVideoIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"featured_video"} ref={ref}/>
});

FeaturedVideoIcon.displayName = "FeaturedVideoIcon";
