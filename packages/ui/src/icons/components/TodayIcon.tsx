import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TodayIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"today"} ref={ref}/>
});

TodayIcon.displayName = "TodayIcon";
