import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TabUnselectedIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"tab_unselected"} ref={ref}/>
});

TabUnselectedIcon.displayName = "TabUnselectedIcon";
