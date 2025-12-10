import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SportsBasketballIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sports_basketball"} ref={ref}/>
});

SportsBasketballIcon.displayName = "SportsBasketballIcon";
