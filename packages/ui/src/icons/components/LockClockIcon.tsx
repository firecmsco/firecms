import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LockClockIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"lock_clock"} ref={ref}/>
});

LockClockIcon.displayName = "LockClockIcon";
