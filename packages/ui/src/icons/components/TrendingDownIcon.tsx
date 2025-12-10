import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TrendingDownIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"trending_down"} ref={ref}/>
});

TrendingDownIcon.displayName = "TrendingDownIcon";
