import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LeaveBagsAtHomeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"leave_bags_at_home"} ref={ref}/>
});

LeaveBagsAtHomeIcon.displayName = "LeaveBagsAtHomeIcon";
