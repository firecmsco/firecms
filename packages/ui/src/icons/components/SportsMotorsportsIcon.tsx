import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SportsMotorsportsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sports_motorsports"} ref={ref}/>
});

SportsMotorsportsIcon.displayName = "SportsMotorsportsIcon";
