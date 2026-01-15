import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WarningAmberIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"warning_amber"} ref={ref}/>
});

WarningAmberIcon.displayName = "WarningAmberIcon";
