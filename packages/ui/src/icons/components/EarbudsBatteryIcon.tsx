import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const EarbudsBatteryIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"earbuds_battery"} ref={ref}/>
});

EarbudsBatteryIcon.displayName = "EarbudsBatteryIcon";
