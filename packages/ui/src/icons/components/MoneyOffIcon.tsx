import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MoneyOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"money_off"} ref={ref}/>
});

MoneyOffIcon.displayName = "MoneyOffIcon";
