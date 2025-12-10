import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const EmergencyShareIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"emergency_share"} ref={ref}/>
});

EmergencyShareIcon.displayName = "EmergencyShareIcon";
