import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LoginIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"login"} ref={ref}/>
});

LoginIcon.displayName = "LoginIcon";
