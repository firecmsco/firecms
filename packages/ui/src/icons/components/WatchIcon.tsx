import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WatchIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"watch"} ref={ref}/>
});

WatchIcon.displayName = "WatchIcon";
