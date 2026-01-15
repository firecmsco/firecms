import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SimCardAlertIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sim_card_alert"} ref={ref}/>
});

SimCardAlertIcon.displayName = "SimCardAlertIcon";
