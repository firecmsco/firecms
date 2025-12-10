import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PhoneEnabledIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"phone_enabled"} ref={ref}/>
});

PhoneEnabledIcon.displayName = "PhoneEnabledIcon";
