import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BusAlertIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"bus_alert"} ref={ref}/>
});

BusAlertIcon.displayName = "BusAlertIcon";
