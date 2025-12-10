import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AccountBalanceIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"account_balance"} ref={ref}/>
});

AccountBalanceIcon.displayName = "AccountBalanceIcon";
