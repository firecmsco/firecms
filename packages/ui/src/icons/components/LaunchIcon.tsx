import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LaunchIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"launch"} ref={ref}/>
});

LaunchIcon.displayName = "LaunchIcon";
