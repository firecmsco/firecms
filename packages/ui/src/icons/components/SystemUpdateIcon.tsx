import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SystemUpdateIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"system_update"} ref={ref}/>
});

SystemUpdateIcon.displayName = "SystemUpdateIcon";
