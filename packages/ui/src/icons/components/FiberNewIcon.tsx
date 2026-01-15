import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FiberNewIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"fiber_new"} ref={ref}/>
});

FiberNewIcon.displayName = "FiberNewIcon";
