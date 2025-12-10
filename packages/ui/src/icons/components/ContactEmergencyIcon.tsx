import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ContactEmergencyIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"contact_emergency"} ref={ref}/>
});

ContactEmergencyIcon.displayName = "ContactEmergencyIcon";
