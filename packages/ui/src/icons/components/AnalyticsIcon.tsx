import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AnalyticsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"analytics"} ref={ref}/>
});

AnalyticsIcon.displayName = "AnalyticsIcon";
