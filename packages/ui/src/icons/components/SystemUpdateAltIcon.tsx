import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SystemUpdateAltIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"system_update_alt"} ref={ref}/>
});

SystemUpdateAltIcon.displayName = "SystemUpdateAltIcon";
