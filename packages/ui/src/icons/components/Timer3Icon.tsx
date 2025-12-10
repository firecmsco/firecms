import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Timer3Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"timer_3"} ref={ref}/>
});

Timer3Icon.displayName = "Timer3Icon";
