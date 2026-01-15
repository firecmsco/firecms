import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const UpcomingIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"upcoming"} ref={ref}/>
});

UpcomingIcon.displayName = "UpcomingIcon";
