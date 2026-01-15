import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SwipeVerticalIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"swipe_vertical"} ref={ref}/>
});

SwipeVerticalIcon.displayName = "SwipeVerticalIcon";
