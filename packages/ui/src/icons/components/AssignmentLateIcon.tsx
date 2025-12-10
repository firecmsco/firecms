import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AssignmentLateIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"assignment_late"} ref={ref}/>
});

AssignmentLateIcon.displayName = "AssignmentLateIcon";
