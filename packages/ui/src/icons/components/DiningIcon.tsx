import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DiningIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"dining"} ref={ref}/>
});

DiningIcon.displayName = "DiningIcon";
