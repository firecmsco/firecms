import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SportsGolfIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sports_golf"} ref={ref}/>
});

SportsGolfIcon.displayName = "SportsGolfIcon";
