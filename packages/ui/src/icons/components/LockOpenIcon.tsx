import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LockOpenIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"lock_open"} ref={ref}/>
});

LockOpenIcon.displayName = "LockOpenIcon";
