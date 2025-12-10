import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PauseCircleOutlineIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"pause_circle_outline"} ref={ref}/>
});

PauseCircleOutlineIcon.displayName = "PauseCircleOutlineIcon";
