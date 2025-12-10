import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ScatterPlotIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"scatter_plot"} ref={ref}/>
});

ScatterPlotIcon.displayName = "ScatterPlotIcon";
