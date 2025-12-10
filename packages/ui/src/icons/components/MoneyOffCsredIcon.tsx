import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MoneyOffCsredIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"money_off_csred"} ref={ref}/>
});

MoneyOffCsredIcon.displayName = "MoneyOffCsredIcon";
