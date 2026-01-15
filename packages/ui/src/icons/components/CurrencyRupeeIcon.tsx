import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CurrencyRupeeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"currency_rupee"} ref={ref}/>
});

CurrencyRupeeIcon.displayName = "CurrencyRupeeIcon";
