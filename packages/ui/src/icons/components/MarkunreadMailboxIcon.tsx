import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MarkunreadMailboxIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"markunread_mailbox"} ref={ref}/>
});

MarkunreadMailboxIcon.displayName = "MarkunreadMailboxIcon";
