import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ToysIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"toys"} ref={ref}/>
});

ToysIcon.displayName = "ToysIcon";
