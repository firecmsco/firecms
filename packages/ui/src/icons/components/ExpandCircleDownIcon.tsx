import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ExpandCircleDownIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"expand_circle_down"} ref={ref}/>
});

ExpandCircleDownIcon.displayName = "ExpandCircleDownIcon";
