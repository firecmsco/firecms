import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MonitorWeightIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"monitor_weight"} ref={ref}/>
});

MonitorWeightIcon.displayName = "MonitorWeightIcon";
