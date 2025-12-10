import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CrisisAlertIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"crisis_alert"} ref={ref}/>
});

CrisisAlertIcon.displayName = "CrisisAlertIcon";
