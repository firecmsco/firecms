import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SyncProblemIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sync_problem"} ref={ref}/>
});

SyncProblemIcon.displayName = "SyncProblemIcon";
