import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TakeoutDiningIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"takeout_dining"} ref={ref}/>
});

TakeoutDiningIcon.displayName = "TakeoutDiningIcon";
