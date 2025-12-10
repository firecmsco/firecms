import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SyncDisabledIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sync_disabled"} ref={ref}/>
});

SyncDisabledIcon.displayName = "SyncDisabledIcon";
