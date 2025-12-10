import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SportsHockeyIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sports_hockey"} ref={ref}/>
});

SportsHockeyIcon.displayName = "SportsHockeyIcon";
