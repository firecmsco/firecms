import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TaskAltIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"task_alt"} ref={ref}/>
});

TaskAltIcon.displayName = "TaskAltIcon";
