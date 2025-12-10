import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SwipeDownAltIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"swipe_down_alt"} ref={ref}/>
});

SwipeDownAltIcon.displayName = "SwipeDownAltIcon";
