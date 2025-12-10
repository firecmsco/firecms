import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AssignmentReturnIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"assignment_return"} ref={ref}/>
});

AssignmentReturnIcon.displayName = "AssignmentReturnIcon";
