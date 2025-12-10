import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AssuredWorkloadIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"assured_workload"} ref={ref}/>
});

AssuredWorkloadIcon.displayName = "AssuredWorkloadIcon";
