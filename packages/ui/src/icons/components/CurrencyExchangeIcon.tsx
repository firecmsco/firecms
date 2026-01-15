import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CurrencyExchangeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"currency_exchange"} ref={ref}/>
});

CurrencyExchangeIcon.displayName = "CurrencyExchangeIcon";
