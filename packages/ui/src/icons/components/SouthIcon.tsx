import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SouthIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"south"} ref={ref}/>
});

SouthIcon.displayName = "SouthIcon";
