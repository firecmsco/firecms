import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LunchDiningIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"lunch_dining"} ref={ref}/>
});

LunchDiningIcon.displayName = "LunchDiningIcon";
