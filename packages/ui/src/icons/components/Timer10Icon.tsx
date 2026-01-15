import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Timer10Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"timer_10"} ref={ref}/>
});

Timer10Icon.displayName = "Timer10Icon";
