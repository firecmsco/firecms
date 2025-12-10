import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AccessibilityNewIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"accessibility_new"} ref={ref}/>
});

AccessibilityNewIcon.displayName = "AccessibilityNewIcon";
