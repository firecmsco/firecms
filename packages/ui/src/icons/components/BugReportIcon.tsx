import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BugReportIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"bug_report"} ref={ref}/>
});

BugReportIcon.displayName = "BugReportIcon";
