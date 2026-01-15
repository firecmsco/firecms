import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const OfflineShareIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"offline_share"} ref={ref}/>
});

OfflineShareIcon.displayName = "OfflineShareIcon";
