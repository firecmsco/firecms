import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CandlestickChartIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"candlestick_chart"} ref={ref}/>
});

CandlestickChartIcon.displayName = "CandlestickChartIcon";
