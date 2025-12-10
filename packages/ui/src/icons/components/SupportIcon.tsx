import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SupportIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"support"} ref={ref}/>
});

SupportIcon.displayName = "SupportIcon";
