import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FiberPinIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"fiber_pin"} ref={ref}/>
});

FiberPinIcon.displayName = "FiberPinIcon";
