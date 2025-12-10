import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SwipeRightAltIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"swipe_right_alt"} ref={ref}/>
});

SwipeRightAltIcon.displayName = "SwipeRightAltIcon";
