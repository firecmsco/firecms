import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DoorbellIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"doorbell"} ref={ref}/>
});

DoorbellIcon.displayName = "DoorbellIcon";
