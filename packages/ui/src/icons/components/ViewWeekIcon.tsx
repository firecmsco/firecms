import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ViewWeekIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"view_week"} ref={ref}/>
});

ViewWeekIcon.displayName = "ViewWeekIcon";
