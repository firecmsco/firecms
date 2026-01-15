import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AvTimerIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"av_timer"} ref={ref}/>
});

AvTimerIcon.displayName = "AvTimerIcon";
