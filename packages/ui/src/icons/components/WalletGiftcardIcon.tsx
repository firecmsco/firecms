import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WalletGiftcardIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"wallet_giftcard"} ref={ref}/>
});

WalletGiftcardIcon.displayName = "WalletGiftcardIcon";
