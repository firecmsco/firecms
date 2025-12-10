import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AssignmentReturnedIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"assignment_returned"} ref={ref}/>
});

AssignmentReturnedIcon.displayName = "AssignmentReturnedIcon";
