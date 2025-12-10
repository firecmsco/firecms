import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BrunchDiningIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"brunch_dining"} ref={ref}/>
});

BrunchDiningIcon.displayName = "BrunchDiningIcon";
