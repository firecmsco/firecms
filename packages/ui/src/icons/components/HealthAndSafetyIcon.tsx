import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HealthAndSafetyIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"health_and_safety"} ref={ref}/>
});

HealthAndSafetyIcon.displayName = "HealthAndSafetyIcon";
