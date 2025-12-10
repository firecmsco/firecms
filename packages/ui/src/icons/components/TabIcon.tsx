import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TabIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"tab"} ref={ref}/>
});

TabIcon.displayName = "TabIcon";
