import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CurrencyRubleIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"currency_ruble"} ref={ref}/>
});

CurrencyRubleIcon.displayName = "CurrencyRubleIcon";
