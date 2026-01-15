import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const EmergencyIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"emergency"} ref={ref}/>
});

EmergencyIcon.displayName = "EmergencyIcon";
