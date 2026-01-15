import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CheckroomIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"checkroom"} ref={ref}/>
});

CheckroomIcon.displayName = "CheckroomIcon";
