import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WaterfallChartIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"waterfall_chart"} ref={ref}/>
});

WaterfallChartIcon.displayName = "WaterfallChartIcon";
