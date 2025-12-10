import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ElectricMopedIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"electric_moped"} ref={ref}/>
});

ElectricMopedIcon.displayName = "ElectricMopedIcon";
