import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CalendarViewDayIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"calendar_view_day"} ref={ref}/>
});

CalendarViewDayIcon.displayName = "CalendarViewDayIcon";
