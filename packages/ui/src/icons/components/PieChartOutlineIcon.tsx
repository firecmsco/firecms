import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PieChartOutlineIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"pie_chart_outline"} ref={ref}/>
});

PieChartOutlineIcon.displayName = "PieChartOutlineIcon";
