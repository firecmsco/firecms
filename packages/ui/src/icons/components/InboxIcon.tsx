import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const InboxIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"inbox"} ref={ref}/>
});

InboxIcon.displayName = "InboxIcon";
