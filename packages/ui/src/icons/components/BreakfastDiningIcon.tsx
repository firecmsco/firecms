import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BreakfastDiningIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"breakfast_dining"} ref={ref}/>
});

BreakfastDiningIcon.displayName = "BreakfastDiningIcon";
