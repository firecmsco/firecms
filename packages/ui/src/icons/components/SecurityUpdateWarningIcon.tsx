import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SecurityUpdateWarningIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"security_update_warning"} ref={ref}/>
});

SecurityUpdateWarningIcon.displayName = "SecurityUpdateWarningIcon";
