import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ElectricScooterIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"electric_scooter"} ref={ref}/>
});

ElectricScooterIcon.displayName = "ElectricScooterIcon";
