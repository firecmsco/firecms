import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PhoneDisabledIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"phone_disabled"} ref={ref}/>
});

PhoneDisabledIcon.displayName = "PhoneDisabledIcon";
