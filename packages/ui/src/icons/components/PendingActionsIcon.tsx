import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PendingActionsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"pending_actions"} ref={ref}/>
});

PendingActionsIcon.displayName = "PendingActionsIcon";
