import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PhoneIphoneIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"phone_iphone"} ref={ref}/>
});

PhoneIphoneIcon.displayName = "PhoneIphoneIcon";
