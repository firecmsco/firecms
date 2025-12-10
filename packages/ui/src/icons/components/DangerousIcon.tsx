import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DangerousIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"dangerous"} ref={ref}/>
});

DangerousIcon.displayName = "DangerousIcon";
