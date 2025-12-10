import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MultilineChartIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"multiline_chart"} ref={ref}/>
});

MultilineChartIcon.displayName = "MultilineChartIcon";
