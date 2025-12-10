import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ThermostatAutoIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"thermostat_auto"} ref={ref}/>
});

ThermostatAutoIcon.displayName = "ThermostatAutoIcon";
