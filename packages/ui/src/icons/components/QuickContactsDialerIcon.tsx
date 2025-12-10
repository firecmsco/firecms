import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const QuickContactsDialerIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"quick_contacts_dialer"} ref={ref}/>
});

QuickContactsDialerIcon.displayName = "QuickContactsDialerIcon";
