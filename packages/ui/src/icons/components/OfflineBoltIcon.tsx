import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const OfflineBoltIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"offline_bolt"} ref={ref}/>
});

OfflineBoltIcon.displayName = "OfflineBoltIcon";
