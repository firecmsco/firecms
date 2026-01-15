import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SellIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sell"} ref={ref}/>
});

SellIcon.displayName = "SellIcon";
