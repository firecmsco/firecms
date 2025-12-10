import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FollowTheSignsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"follow_the_signs"} ref={ref}/>
});

FollowTheSignsIcon.displayName = "FollowTheSignsIcon";
