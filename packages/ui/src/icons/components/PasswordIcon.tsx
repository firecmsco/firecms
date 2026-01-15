import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PasswordIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"password"} ref={ref}/>
});

PasswordIcon.displayName = "PasswordIcon";
