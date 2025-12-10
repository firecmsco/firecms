import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RouterIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"router"} ref={ref}/>
});

RouterIcon.displayName = "RouterIcon";
