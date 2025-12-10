import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MemoryIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"memory"} ref={ref}/>
});

MemoryIcon.displayName = "MemoryIcon";
