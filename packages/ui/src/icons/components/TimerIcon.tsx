import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TimerIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"timer"} ref={ref}/>
});

TimerIcon.displayName = "TimerIcon";
