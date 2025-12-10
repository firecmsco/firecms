import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SocialDistanceIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"social_distance"} ref={ref}/>
});

SocialDistanceIcon.displayName = "SocialDistanceIcon";
