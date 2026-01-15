import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ElectricalServicesIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"electrical_services"} ref={ref}/>
});

ElectricalServicesIcon.displayName = "ElectricalServicesIcon";
