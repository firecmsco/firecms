import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SecurityIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"security"} ref={ref}/>
});

SecurityIcon.displayName = "SecurityIcon";
