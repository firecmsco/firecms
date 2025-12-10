import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CalendarMonthIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"calendar_month"} ref={ref}/>
});

CalendarMonthIcon.displayName = "CalendarMonthIcon";
