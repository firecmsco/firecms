import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ViewCarouselIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"view_carousel"} ref={ref}/>
});

ViewCarouselIcon.displayName = "ViewCarouselIcon";
