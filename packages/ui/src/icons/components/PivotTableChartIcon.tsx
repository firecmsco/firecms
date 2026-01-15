import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PivotTableChartIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"pivot_table_chart"} ref={ref}/>
});

PivotTableChartIcon.displayName = "PivotTableChartIcon";
