import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ElectricRickshawIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"electric_rickshaw"} ref={ref}/>
});

ElectricRickshawIcon.displayName = "ElectricRickshawIcon";
