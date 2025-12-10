import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SouthAmericaIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"south_america"} ref={ref}/>
});

SouthAmericaIcon.displayName = "SouthAmericaIcon";
