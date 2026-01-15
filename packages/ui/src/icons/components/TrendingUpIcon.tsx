import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TrendingUpIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"trending_up"} ref={ref}/>
});

TrendingUpIcon.displayName = "TrendingUpIcon";
