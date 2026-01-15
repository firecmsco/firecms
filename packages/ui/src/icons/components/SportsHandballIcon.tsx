import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SportsHandballIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sports_handball"} ref={ref}/>
});

SportsHandballIcon.displayName = "SportsHandballIcon";
