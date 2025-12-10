import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LockResetIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"lock_reset"} ref={ref}/>
});

LockResetIcon.displayName = "LockResetIcon";
