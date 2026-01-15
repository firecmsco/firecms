import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Battery3BarIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"battery_3_bar"} ref={ref}/>
});

Battery3BarIcon.displayName = "Battery3BarIcon";
