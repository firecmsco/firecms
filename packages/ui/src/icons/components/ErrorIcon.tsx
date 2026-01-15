import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ErrorIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"error"} ref={ref}/>
});

ErrorIcon.displayName = "ErrorIcon";
