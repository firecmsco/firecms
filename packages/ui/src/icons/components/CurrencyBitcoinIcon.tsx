import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CurrencyBitcoinIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"currency_bitcoin"} ref={ref}/>
});

CurrencyBitcoinIcon.displayName = "CurrencyBitcoinIcon";
