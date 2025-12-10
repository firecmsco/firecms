import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TabletIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"tablet"} ref={ref}/>
});

TabletIcon.displayName = "TabletIcon";
