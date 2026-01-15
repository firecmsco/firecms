import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RailwayAlertIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"railway_alert"} ref={ref}/>
});

RailwayAlertIcon.displayName = "RailwayAlertIcon";
