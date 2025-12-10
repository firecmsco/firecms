import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BarChartIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"bar_chart"} ref={ref}/>
});

BarChartIcon.displayName = "BarChartIcon";
