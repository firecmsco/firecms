import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TimerOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"timer_off"} ref={ref}/>
});

TimerOffIcon.displayName = "TimerOffIcon";
