import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SyncLockIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sync_lock"} ref={ref}/>
});

SyncLockIcon.displayName = "SyncLockIcon";
