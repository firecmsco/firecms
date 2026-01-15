import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MenuOpenIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"menu_open"} ref={ref}/>
});

MenuOpenIcon.displayName = "MenuOpenIcon";
