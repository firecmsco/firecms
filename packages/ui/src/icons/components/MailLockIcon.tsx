import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MailLockIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"mail_lock"} ref={ref}/>
});

MailLockIcon.displayName = "MailLockIcon";
