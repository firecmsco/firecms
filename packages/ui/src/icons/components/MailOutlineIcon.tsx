import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MailOutlineIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"mail_outline"} ref={ref}/>
});

MailOutlineIcon.displayName = "MailOutlineIcon";
