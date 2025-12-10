import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ShieldMoonIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"shield_moon"} ref={ref}/>
});

ShieldMoonIcon.displayName = "ShieldMoonIcon";
