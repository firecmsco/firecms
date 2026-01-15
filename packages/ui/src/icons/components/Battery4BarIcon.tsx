import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Battery4BarIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"battery_4_bar"} ref={ref}/>
});

Battery4BarIcon.displayName = "Battery4BarIcon";
