import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ThermostatIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"thermostat"} ref={ref}/>
});

ThermostatIcon.displayName = "ThermostatIcon";
