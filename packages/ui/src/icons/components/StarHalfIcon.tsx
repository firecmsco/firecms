import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const StarHalfIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"star_half"} ref={ref}/>
});

StarHalfIcon.displayName = "StarHalfIcon";
