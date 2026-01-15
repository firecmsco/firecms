import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SwipeDownIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"swipe_down"} ref={ref}/>
});

SwipeDownIcon.displayName = "SwipeDownIcon";
