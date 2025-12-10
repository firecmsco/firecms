import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PauseCircleFilledIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"pause_circle_filled"} ref={ref}/>
});

PauseCircleFilledIcon.displayName = "PauseCircleFilledIcon";
