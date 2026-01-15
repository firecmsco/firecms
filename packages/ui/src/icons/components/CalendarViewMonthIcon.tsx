import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CalendarViewMonthIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"calendar_view_month"} ref={ref}/>
});

CalendarViewMonthIcon.displayName = "CalendarViewMonthIcon";
