import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WatchLaterIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"watch_later"} ref={ref}/>
});

WatchLaterIcon.displayName = "WatchLaterIcon";
