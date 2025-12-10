import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CurrencyPoundIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"currency_pound"} ref={ref}/>
});

CurrencyPoundIcon.displayName = "CurrencyPoundIcon";
