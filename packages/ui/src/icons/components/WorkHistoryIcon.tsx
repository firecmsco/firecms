import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WorkHistoryIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"work_history"} ref={ref}/>
});

WorkHistoryIcon.displayName = "WorkHistoryIcon";
