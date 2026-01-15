import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SmsFailedIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sms_failed"} ref={ref}/>
});

SmsFailedIcon.displayName = "SmsFailedIcon";
