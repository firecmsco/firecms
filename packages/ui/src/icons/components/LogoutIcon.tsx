import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LogoutIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"logout"} ref={ref}/>
});

LogoutIcon.displayName = "LogoutIcon";
