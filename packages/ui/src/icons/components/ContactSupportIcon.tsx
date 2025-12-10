import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ContactSupportIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"contact_support"} ref={ref}/>
});

ContactSupportIcon.displayName = "ContactSupportIcon";
