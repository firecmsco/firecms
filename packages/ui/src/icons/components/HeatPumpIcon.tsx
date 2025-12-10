import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HeatPumpIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"heat_pump"} ref={ref}/>
});

HeatPumpIcon.displayName = "HeatPumpIcon";
