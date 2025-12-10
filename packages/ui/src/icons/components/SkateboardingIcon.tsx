import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SkateboardingIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"skateboarding"} ref={ref}/>
});

SkateboardingIcon.displayName = "SkateboardingIcon";
