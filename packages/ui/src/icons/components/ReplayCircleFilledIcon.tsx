import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ReplayCircleFilledIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"replay_circle_filled"} ref={ref}/>
});

ReplayCircleFilledIcon.displayName = "ReplayCircleFilledIcon";
