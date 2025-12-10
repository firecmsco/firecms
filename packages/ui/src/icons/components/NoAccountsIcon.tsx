import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NoAccountsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"no_accounts"} ref={ref}/>
});

NoAccountsIcon.displayName = "NoAccountsIcon";
