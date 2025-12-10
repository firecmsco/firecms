import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AccessibleForwardIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"accessible_forward"} ref={ref}/>
});

AccessibleForwardIcon.displayName = "AccessibleForwardIcon";
