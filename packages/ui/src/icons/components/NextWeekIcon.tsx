import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NextWeekIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"next_week"} ref={ref}/>
});

NextWeekIcon.displayName = "NextWeekIcon";
