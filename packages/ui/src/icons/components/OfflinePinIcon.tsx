import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const OfflinePinIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"offline_pin"} ref={ref}/>
});

OfflinePinIcon.displayName = "OfflinePinIcon";
