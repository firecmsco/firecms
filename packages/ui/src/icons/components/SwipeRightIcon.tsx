import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SwipeRightIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"swipe_right"} ref={ref}/>
});

SwipeRightIcon.displayName = "SwipeRightIcon";
