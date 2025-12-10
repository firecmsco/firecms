import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const QuickContactsMailIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"quick_contacts_mail"} ref={ref}/>
});

QuickContactsMailIcon.displayName = "QuickContactsMailIcon";
