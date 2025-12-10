import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ContactPhoneIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"contact_phone"} ref={ref}/>
});

ContactPhoneIcon.displayName = "ContactPhoneIcon";
