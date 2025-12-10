import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Timer10SelectIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"timer_10_select"} ref={ref}/>
});

Timer10SelectIcon.displayName = "Timer10SelectIcon";
