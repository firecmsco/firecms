import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WalletIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"wallet"} ref={ref}/>
});

WalletIcon.displayName = "WalletIcon";
