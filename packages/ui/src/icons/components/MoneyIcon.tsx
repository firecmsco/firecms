import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MoneyIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"money"} ref={ref}/>
});

MoneyIcon.displayName = "MoneyIcon";
