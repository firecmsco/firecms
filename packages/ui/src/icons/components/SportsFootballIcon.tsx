import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SportsFootballIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sports_football"} ref={ref}/>
});

SportsFootballIcon.displayName = "SportsFootballIcon";
