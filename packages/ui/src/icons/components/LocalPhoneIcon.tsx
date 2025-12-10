import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LocalPhoneIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"local_phone"} ref={ref}/>
});

LocalPhoneIcon.displayName = "LocalPhoneIcon";
