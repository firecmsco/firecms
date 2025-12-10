import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PhoneAndroidIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"phone_android"} ref={ref}/>
});

PhoneAndroidIcon.displayName = "PhoneAndroidIcon";
