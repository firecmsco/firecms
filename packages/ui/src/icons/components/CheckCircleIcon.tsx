import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CheckCircleIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"check_circle"} ref={ref}/>
});

CheckCircleIcon.displayName = "CheckCircleIcon";
