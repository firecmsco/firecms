import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AllInboxIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"all_inbox"} ref={ref}/>
});

AllInboxIcon.displayName = "AllInboxIcon";
