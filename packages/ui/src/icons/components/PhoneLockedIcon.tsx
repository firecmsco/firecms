import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PhoneLockedIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"phone_locked"} ref={ref}/>
});

PhoneLockedIcon.displayName = "PhoneLockedIcon";
