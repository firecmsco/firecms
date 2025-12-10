import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AccessTimeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"access_time"} ref={ref}/>
});

AccessTimeIcon.displayName = "AccessTimeIcon";
