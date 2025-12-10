import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PendingIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"pending"} ref={ref}/>
});

PendingIcon.displayName = "PendingIcon";
