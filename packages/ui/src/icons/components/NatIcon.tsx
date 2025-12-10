import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NatIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"nat"} ref={ref}/>
});

NatIcon.displayName = "NatIcon";
