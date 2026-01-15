import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SmsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sms"} ref={ref}/>
});

SmsIcon.displayName = "SmsIcon";
