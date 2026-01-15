import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MenuIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"menu"} ref={ref}/>
});

MenuIcon.displayName = "MenuIcon";
