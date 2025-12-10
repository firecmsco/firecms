import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Battery0BarIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"battery_0_bar"} ref={ref}/>
});

Battery0BarIcon.displayName = "Battery0BarIcon";
