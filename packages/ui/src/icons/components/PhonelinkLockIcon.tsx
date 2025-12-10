import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PhonelinkLockIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"phonelink_lock"} ref={ref}/>
});

PhonelinkLockIcon.displayName = "PhonelinkLockIcon";
