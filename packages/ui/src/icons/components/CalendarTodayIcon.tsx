import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CalendarTodayIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"calendar_today"} ref={ref}/>
});

CalendarTodayIcon.displayName = "CalendarTodayIcon";
