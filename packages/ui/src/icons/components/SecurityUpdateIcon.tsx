import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SecurityUpdateIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"security_update"} ref={ref}/>
});

SecurityUpdateIcon.displayName = "SecurityUpdateIcon";
