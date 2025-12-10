import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SnowboardingIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"snowboarding"} ref={ref}/>
});

SnowboardingIcon.displayName = "SnowboardingIcon";
