import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SwipeLeftAltIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"swipe_left_alt"} ref={ref}/>
});

SwipeLeftAltIcon.displayName = "SwipeLeftAltIcon";
