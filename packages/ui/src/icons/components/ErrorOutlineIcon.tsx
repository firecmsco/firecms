import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ErrorOutlineIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"error_outline"} ref={ref}/>
});

ErrorOutlineIcon.displayName = "ErrorOutlineIcon";
