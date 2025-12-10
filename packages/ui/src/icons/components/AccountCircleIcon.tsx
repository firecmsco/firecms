import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AccountCircleIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"account_circle"} ref={ref}/>
});

AccountCircleIcon.displayName = "AccountCircleIcon";
