import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LocalFireDepartmentIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"local_fire_department"} ref={ref}/>
});

LocalFireDepartmentIcon.displayName = "LocalFireDepartmentIcon";
