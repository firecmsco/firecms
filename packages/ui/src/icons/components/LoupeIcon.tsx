import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LoupeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"loupe"} ref={ref}/>
});

LoupeIcon.displayName = "LoupeIcon";
