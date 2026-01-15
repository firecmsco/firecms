import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ReportIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"report"} ref={ref}/>
});

ReportIcon.displayName = "ReportIcon";
