import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AssignmentIndIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"assignment_ind"} ref={ref}/>
});

AssignmentIndIcon.displayName = "AssignmentIndIcon";
