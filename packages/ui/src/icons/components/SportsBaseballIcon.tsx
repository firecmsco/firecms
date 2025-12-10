import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SportsBaseballIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sports_baseball"} ref={ref}/>
});

SportsBaseballIcon.displayName = "SportsBaseballIcon";
