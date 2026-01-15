import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Battery5BarIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"battery_5_bar"} ref={ref}/>
});

Battery5BarIcon.displayName = "Battery5BarIcon";
