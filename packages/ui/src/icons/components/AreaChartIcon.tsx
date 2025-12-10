import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AreaChartIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"area_chart"} ref={ref}/>
});

AreaChartIcon.displayName = "AreaChartIcon";
