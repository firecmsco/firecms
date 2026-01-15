import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AccountBalanceWalletIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"account_balance_wallet"} ref={ref}/>
});

AccountBalanceWalletIcon.displayName = "AccountBalanceWalletIcon";
