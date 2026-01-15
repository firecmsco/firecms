import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PriorityHighIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"priority_high"} ref={ref}/>
});

PriorityHighIcon.displayName = "PriorityHighIcon";
