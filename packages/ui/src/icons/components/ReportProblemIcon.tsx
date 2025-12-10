import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ReportProblemIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"report_problem"} ref={ref}/>
});

ReportProblemIcon.displayName = "ReportProblemIcon";
