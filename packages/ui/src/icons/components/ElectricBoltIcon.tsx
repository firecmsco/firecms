import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ElectricBoltIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"electric_bolt"} ref={ref}/>
});

ElectricBoltIcon.displayName = "ElectricBoltIcon";
