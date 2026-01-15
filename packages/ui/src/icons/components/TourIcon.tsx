import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TourIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"tour"} ref={ref}/>
});

TourIcon.displayName = "TourIcon";
