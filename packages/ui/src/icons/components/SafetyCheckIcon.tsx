import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SafetyCheckIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"safety_check"} ref={ref}/>
});

SafetyCheckIcon.displayName = "SafetyCheckIcon";
