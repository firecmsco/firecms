import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SafetyDividerIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"safety_divider"} ref={ref}/>
});

SafetyDividerIcon.displayName = "SafetyDividerIcon";
