import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WeekendIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"weekend"} ref={ref}/>
});

WeekendIcon.displayName = "WeekendIcon";
