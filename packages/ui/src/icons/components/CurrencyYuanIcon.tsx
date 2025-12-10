import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CurrencyYuanIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"currency_yuan"} ref={ref}/>
});

CurrencyYuanIcon.displayName = "CurrencyYuanIcon";
