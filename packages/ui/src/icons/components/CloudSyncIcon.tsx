import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CloudSyncIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"cloud_sync"} ref={ref}/>
});

CloudSyncIcon.displayName = "CloudSyncIcon";
