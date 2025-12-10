import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SsidChartIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"ssid_chart"} ref={ref}/>
});

SsidChartIcon.displayName = "SsidChartIcon";
