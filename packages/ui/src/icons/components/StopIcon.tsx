import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const StopIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"stop"} ref={ref}/>
});

StopIcon.displayName = "StopIcon";
