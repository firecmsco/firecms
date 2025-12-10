import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const StackedLineChartIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"stacked_line_chart"} ref={ref}/>
});

StackedLineChartIcon.displayName = "StackedLineChartIcon";
