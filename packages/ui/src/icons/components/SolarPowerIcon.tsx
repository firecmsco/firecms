import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SolarPowerIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"solar_power"} ref={ref}/>
});

SolarPowerIcon.displayName = "SolarPowerIcon";
