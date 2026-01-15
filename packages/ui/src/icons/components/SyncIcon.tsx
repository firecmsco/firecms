import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SyncIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sync"} ref={ref}/>
});

SyncIcon.displayName = "SyncIcon";
