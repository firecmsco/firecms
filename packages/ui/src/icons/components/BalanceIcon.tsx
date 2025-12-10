import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BalanceIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"balance"} ref={ref}/>
});

BalanceIcon.displayName = "BalanceIcon";
