import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PhoneCallbackIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"phone_callback"} ref={ref}/>
});

PhoneCallbackIcon.displayName = "PhoneCallbackIcon";
