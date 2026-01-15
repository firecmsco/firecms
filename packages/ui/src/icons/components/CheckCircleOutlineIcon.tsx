import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CheckCircleOutlineIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"check_circle_outline"} ref={ref}/>
});

CheckCircleOutlineIcon.displayName = "CheckCircleOutlineIcon";
