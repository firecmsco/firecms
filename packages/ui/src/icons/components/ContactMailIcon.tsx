import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ContactMailIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"contact_mail"} ref={ref}/>
});

ContactMailIcon.displayName = "ContactMailIcon";
