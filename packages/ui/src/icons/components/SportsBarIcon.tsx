import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SportsBarIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sports_bar"} ref={ref}/>
});

SportsBarIcon.displayName = "SportsBarIcon";
