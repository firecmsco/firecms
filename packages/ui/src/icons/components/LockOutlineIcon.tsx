import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LockOutlineIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"lock_outline"} ref={ref}/>
});

LockOutlineIcon.displayName = "LockOutlineIcon";
