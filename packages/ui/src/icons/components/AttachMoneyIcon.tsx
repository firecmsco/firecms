import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AttachMoneyIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"attach_money"} ref={ref}/>
});

AttachMoneyIcon.displayName = "AttachMoneyIcon";
