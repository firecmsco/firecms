import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SyncAltIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sync_alt"} ref={ref}/>
});

SyncAltIcon.displayName = "SyncAltIcon";
