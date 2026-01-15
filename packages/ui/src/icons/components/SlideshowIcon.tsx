import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SlideshowIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"slideshow"} ref={ref}/>
});

SlideshowIcon.displayName = "SlideshowIcon";
