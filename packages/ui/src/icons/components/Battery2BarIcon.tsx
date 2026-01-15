import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Battery2BarIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"battery_2_bar"} ref={ref}/>
});

Battery2BarIcon.displayName = "Battery2BarIcon";
