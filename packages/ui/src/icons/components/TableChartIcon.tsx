import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TableChartIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"table_chart"} ref={ref}/>
});

TableChartIcon.displayName = "TableChartIcon";
