import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CenterFocusWeakIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"center_focus_weak"} ref={ref}/>
});

CenterFocusWeakIcon.displayName = "CenterFocusWeakIcon";
