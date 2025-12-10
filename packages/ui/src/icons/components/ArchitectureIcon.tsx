import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ArchitectureIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"architecture"} ref={ref}/>
});

ArchitectureIcon.displayName = "ArchitectureIcon";
