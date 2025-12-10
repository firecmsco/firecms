import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DateRangeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"date_range"} ref={ref}/>
});

DateRangeIcon.displayName = "DateRangeIcon";
