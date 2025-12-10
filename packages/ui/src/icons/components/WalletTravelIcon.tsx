import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WalletTravelIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"wallet_travel"} ref={ref}/>
});

WalletTravelIcon.displayName = "WalletTravelIcon";
