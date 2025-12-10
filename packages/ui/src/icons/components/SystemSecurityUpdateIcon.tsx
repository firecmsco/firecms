import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SystemSecurityUpdateIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"system_security_update"} ref={ref}/>
});

SystemSecurityUpdateIcon.displayName = "SystemSecurityUpdateIcon";
