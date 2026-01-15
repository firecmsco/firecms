import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DeviceThermostatIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"device_thermostat"} ref={ref}/>
});

DeviceThermostatIcon.displayName = "DeviceThermostatIcon";
