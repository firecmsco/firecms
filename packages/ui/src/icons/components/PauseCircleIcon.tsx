import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PauseCircleIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"pause_circle"} ref={ref}/>
});

PauseCircleIcon.displayName = "PauseCircleIcon";
