import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const StackedBarChartIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"stacked_bar_chart"} ref={ref}/>
});

StackedBarChartIcon.displayName = "StackedBarChartIcon";
