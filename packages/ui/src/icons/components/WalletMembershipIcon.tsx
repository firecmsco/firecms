import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WalletMembershipIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"wallet_membership"} ref={ref}/>
});

WalletMembershipIcon.displayName = "WalletMembershipIcon";
