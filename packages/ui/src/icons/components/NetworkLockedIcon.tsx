import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NetworkLockedIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"network_locked"} ref={ref}/>
});

NetworkLockedIcon.displayName = "NetworkLockedIcon";
