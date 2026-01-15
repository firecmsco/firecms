import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FiberDvrIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"fiber_dvr"} ref={ref}/>
});

FiberDvrIcon.displayName = "FiberDvrIcon";
