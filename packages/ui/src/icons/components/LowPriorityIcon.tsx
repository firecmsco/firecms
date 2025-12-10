import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LowPriorityIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"low_priority"} ref={ref}/>
});

LowPriorityIcon.displayName = "LowPriorityIcon";
