import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ContactPageIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"contact_page"} ref={ref}/>
});

ContactPageIcon.displayName = "ContactPageIcon";
