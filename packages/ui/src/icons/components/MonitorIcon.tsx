import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MonitorIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"monitor"} ref={ref}/>
});

MonitorIcon.displayName = "MonitorIcon";
