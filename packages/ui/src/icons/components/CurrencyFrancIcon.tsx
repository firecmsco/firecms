import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CurrencyFrancIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"currency_franc"} ref={ref}/>
});

CurrencyFrancIcon.displayName = "CurrencyFrancIcon";
