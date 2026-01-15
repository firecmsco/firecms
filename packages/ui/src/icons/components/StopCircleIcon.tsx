import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const StopCircleIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"stop_circle"} ref={ref}/>
});

StopCircleIcon.displayName = "StopCircleIcon";
