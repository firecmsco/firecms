import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SystemSecurityUpdateWarningIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"system_security_update_warning"} ref={ref}/>
});

SystemSecurityUpdateWarningIcon.displayName = "SystemSecurityUpdateWarningIcon";
