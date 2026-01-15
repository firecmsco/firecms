import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AccessibilityIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"accessibility"} ref={ref}/>
});

AccessibilityIcon.displayName = "AccessibilityIcon";
