import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SportsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sports"} ref={ref}/>
});

SportsIcon.displayName = "SportsIcon";
