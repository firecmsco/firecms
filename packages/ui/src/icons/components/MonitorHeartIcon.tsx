import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MonitorHeartIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"monitor_heart"} ref={ref}/>
});

MonitorHeartIcon.displayName = "MonitorHeartIcon";
