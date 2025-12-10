import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ReviewsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"reviews"} ref={ref}/>
});

ReviewsIcon.displayName = "ReviewsIcon";
