import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PieChartIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"pie_chart"} ref={ref}/>
});

PieChartIcon.displayName = "PieChartIcon";
