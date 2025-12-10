import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TaskIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"task"} ref={ref}/>
});

TaskIcon.displayName = "TaskIcon";
