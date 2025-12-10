import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BubbleChartIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"bubble_chart"} ref={ref}/>
});

BubbleChartIcon.displayName = "BubbleChartIcon";
