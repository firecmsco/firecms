import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AccountBoxIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"account_box"} ref={ref}/>
});

AccountBoxIcon.displayName = "AccountBoxIcon";
