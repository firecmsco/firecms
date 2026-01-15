import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ElectricMeterIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"electric_meter"} ref={ref}/>
});

ElectricMeterIcon.displayName = "ElectricMeterIcon";
