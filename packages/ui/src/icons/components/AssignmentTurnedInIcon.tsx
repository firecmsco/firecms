import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AssignmentTurnedInIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"assignment_turned_in"} ref={ref}/>
});

AssignmentTurnedInIcon.displayName = "AssignmentTurnedInIcon";
