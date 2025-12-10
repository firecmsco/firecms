import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Timer3SelectIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"timer_3_select"} ref={ref}/>
});

Timer3SelectIcon.displayName = "Timer3SelectIcon";
