import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SwipeUpAltIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"swipe_up_alt"} ref={ref}/>
});

SwipeUpAltIcon.displayName = "SwipeUpAltIcon";
