import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AppBlockingIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"app_blocking"} ref={ref}/>
});

AppBlockingIcon.displayName = "AppBlockingIcon";
