import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WarningIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"warning"} ref={ref}/>
});

WarningIcon.displayName = "WarningIcon";
