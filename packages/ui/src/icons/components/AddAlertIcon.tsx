import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AddAlertIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"add_alert"} ref={ref}/>
});

AddAlertIcon.displayName = "AddAlertIcon";
