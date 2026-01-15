import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PhoneForwardedIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"phone_forwarded"} ref={ref}/>
});

PhoneForwardedIcon.displayName = "PhoneForwardedIcon";
