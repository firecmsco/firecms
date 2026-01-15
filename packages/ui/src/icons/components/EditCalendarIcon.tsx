import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const EditCalendarIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"edit_calendar"} ref={ref}/>
});

EditCalendarIcon.displayName = "EditCalendarIcon";
