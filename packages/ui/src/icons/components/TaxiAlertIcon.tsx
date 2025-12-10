import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TaxiAlertIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"taxi_alert"} ref={ref}/>
});

TaxiAlertIcon.displayName = "TaxiAlertIcon";
