import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PermContactCalendarIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"perm_contact_calendar"} ref={ref}/>
});

PermContactCalendarIcon.displayName = "PermContactCalendarIcon";
