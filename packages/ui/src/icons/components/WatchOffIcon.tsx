import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WatchOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"watch_off"} ref={ref}/>
});

WatchOffIcon.displayName = "WatchOffIcon";
